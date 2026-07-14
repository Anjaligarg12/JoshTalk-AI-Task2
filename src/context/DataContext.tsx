import React, { createContext, useContext, useState, useEffect } from 'react';

// Interfaces
export interface Contributor {
  id: string;
  name: string;
  avatar: string;
  qualityScore: number; // 40 to 100 (higher is better)
  status: 'safe' | 'warning' | 'blocked';
  accuracy: number;
  joinedDate: string;
  dateCreated: Date; // For date range filtering
  completedTasks: number;
  previousWarnings: number;
  metrics: {
    typingSpeed: number; // WPM
    charactersPerSecond: number; // CPS
    copyPasteCount: number;
    tabSwitches: number;
    pauseFrequency: number; // Pauses/min
    playbackSpeed: number; // Avg playback speed
    silenceSkips: number;
    editRate: number; // % edits/backspaces (Edit Rate)
    listeningRatio: number; // playback time / audio length
    scrubCount: number;
    totalAudioDuration: number; // mins
    totalWorkingTime: number; // mins
  };
  timeline: {
    time: string;
    event: string;
    details: string;
    type: 'audio' | 'focus' | 'clipboard' | 'typing' | 'system';
  }[];
  recentSubmissions: {
    id: string;
    audioTitle: string;
    submittedText: string;
    duration: string;
    timestamp: string;
    date: Date;
    riskTriggered: string | null;
  }[];
}

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  explanation: string;
  recommendedAction: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'typing' | 'audio' | 'focus' | 'clipboard';
  isEnabled: boolean;
  threshold: number;
  minThreshold: number;
  maxThreshold: number;
  unit: string;
  weight: number; // 0 to 10
}

export interface Alert {
  id: string;
  contributorId: string;
  contributorName: string;
  ruleName: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  value: string;
}

export interface Recommendation {
  id: string;
  contributorId: string;
  contributorName: string;
  riskScore: number; // 0 to 100 (100 - qualityScore)
  listeningRatio: number;
  editRate: number;
  charactersPerSecond: number;
  detectionReason: string;
  action: 'Send Warning' | 'Manual Review' | 'Temporary Suspend' | 'Block User';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'blocked';
  timestamp: string;
}

interface DataContextType {
  contributors: Contributor[];
  rules: DetectionRule[];
  alerts: Alert[];
  recommendations: Recommendation[];
  toggleRule: (id: string) => void;
  updateRuleThreshold: (id: string, threshold: number) => void;
  updateRuleWeight: (id: string, weight: number) => void;
  flagContributor: (id: string, status: Contributor['status']) => void;
  executeRecommendation: (id: string, actionResult: 'approved' | 'blocked') => void;
  snoozeRecommendation: (id: string) => void;
  addCustomRule: (rule: Omit<DetectionRule, 'id' | 'isEnabled'>) => void;
  markAllAlertsAsRead: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial Detection Rules aligned to transcription specific metrics
const initialRules: DetectionRule[] = [
  {
    id: 'rule-listening-ratio',
    name: 'Audio Playback skips (Listening Ratio)',
    description: 'Monitors the playback ratio to ensure transcribers play audio rather than skipping sections.',
    explanation: 'User playback duration is below the 70% threshold of the total audio duration, suggesting they are skipping audio segments.',
    recommendedAction: 'Issue Warning and audit work logs coverage.',
    severity: 'high',
    category: 'audio',
    isEnabled: true,
    threshold: 70,
    minThreshold: 35,
    maxThreshold: 98,
    unit: '%',
    weight: 8,
  },
  {
    id: 'rule-edit-rate',
    name: 'Keystroke Correction rate (Edit Rate)',
    description: 'Detects a lack of typos or adjustments, indicating blind copying of Whisper outputs.',
    explanation: 'Typography correction rate is below 10%. Backspaces/deletions are too low for manual human copy work, indicating blind acceptance of automated Whisper transcripts.',
    recommendedAction: 'Flag for manual review spot check.',
    severity: 'medium',
    category: 'typing',
    isEnabled: true,
    threshold: 10,
    minThreshold: 2,
    maxThreshold: 35,
    unit: '%',
    weight: 6,
  },
  {
    id: 'rule-cps-limit',
    name: 'Characters Per Second Limit (CPS)',
    description: 'Flags input speeds exceeding human typing capacities to catch macro automation.',
    explanation: 'Entry speed exceeds 8 characters per second (CPS). Exceeds physical speed limits of manual human keyboard entry, suggesting auto-clicker scripts.',
    recommendedAction: 'Issue Warning or restrict account access.',
    severity: 'high',
    category: 'typing',
    isEnabled: true,
    threshold: 8,
    minThreshold: 3,
    maxThreshold: 12,
    unit: 'CPS',
    weight: 8,
  },
  {
    id: 'rule-repeated-suspicious',
    name: 'Repeated Suspicious Behavior',
    description: 'Triggers when user triggers multiple flags or focus changes across independent tasks.',
    explanation: 'User accumulates anomalous focus loss, clipboard copies, or playback skips across 3 or more independent audio tasks.',
    recommendedAction: 'Block user profile and restrict workspace access.',
    severity: 'critical',
    category: 'focus',
    isEnabled: true,
    threshold: 3,
    minThreshold: 1,
    maxThreshold: 8,
    unit: 'tasks',
    weight: 10,
  }
];

// Generate Dates helper
const today = new Date();
const getPastDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(today.getDate() - daysAgo);
  return d;
};

// Generate 100 Contributors (72 Safe, 18 Warning, 10 Blocked)
// Guarantees mathematically exact averages for the default view:
// Average Quality Score: 87%
// Average Listening Ratio: 84%
// Average Edit Rate: 18%
// Average CPS: 5.2 CPS
const generateContributors = (): Contributor[] => {
  const list: Contributor[] = [];
  
  // Safe Names list (72 names)
  const safeNames = [
    "Sarah Jenkins", "Mei-Ling Chen", "Marcus Thorne", "Anita Roy", "Leo Martinez", "Emily Watson",
    "Aarav Sharma", "Chloe Dubois", "Kenji Tanaka", "Sofia Bianchi", "Lucas Smith", "Amara Diallo",
    "Elena Petrova", "Gabriel Silva", "Fatima Al-Farsi", "Hans Mueller", "Ji-Yeon Kim", "Oliver Brown",
    "Maria Garcia", "Yuki Sato", "Alexandre Martin", "Zahra Ahmadi", "John Adams", "Carlos Santana",
    "Anna Kowalski", "Ali Hassan", "Ingrid Nilsson", "Dimitri Ivanov", "Sven Lindstrom", "Jane Eyre",
    "Ravi Kumar", "Linh Nguyen", "Fatoumata Keita", "Niels Bohr", "Marie Curie", "Albert Einstein",
    "Ada Lovelace", "Alan Turing", "Grace Hopper", "Isaac Newton", "Charles Darwin", "Galileo Galilei",
    "Nikola Tesla", "Thomas Edison", "Benjamin Franklin", "Leonardo da Vinci", "Michelangelo Buonarroti",
    "Vincent van Gogh", "Pablo Picasso", "Claude Monet", "Georgia O'Keeffe", "Frida Kahlo", "Salvador Dali",
    "Andy Warhol", "Jackson Pollock", "Mark Rothko", "Henri Matisse", "Edvard Munch", "Rene Magritte",
    "Wassily Kandinsky", "Paul Klee", "Joan Miro", "Piet Mondrian", "Marc Chagall", "Gustav Klimt",
    "Egon Schiele", "Max Ernst", "Marcel Duchamp", "Francis Bacon", "Lucian Freud", "David Hockney", "Damien Hirst"
  ];

  // Warning Names list (18 names)
  const warningNames = [
    "Alex Rivera", "David Miller", "John Doe", "Priya Nair", "Kenji Sato",
    "Christian Bale", "Robert Downey", "Chris Evans", "Scarlett Johansson", "Mark Ruffalo",
    "Jeremy Renner", "Elizabeth Olsen", "Paul Bettany", "Tom Holland", "Benedict Cumberbatch",
    "Chadwick Boseman", "Brie Larson", "Tom Hiddleston"
  ];

  // Blocked Names list (10 names)
  const blockedNames = [
    "Sophia Patel", "Robert Vance", "James Kelly", "Clara Oswald",
    "Buster Bot", "Spam Automaton", "Click farm 04", "Robo Transcriber",
    "Autoclicker script", "Fake contributor 99"
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Safe parameters prep: targets average 96.38% Quality, 94% Listening, 21.5% Edits, 4.4 CPS
  const safeScores = Array(72);
  for (let i = 0; i < 44; i++) safeScores[i] = 96;
  for (let i = 44; i < 72; i++) safeScores[i] = 97;

  const safeListening = Array(72).fill(0.94);
  const safeEdits = Array(72).fill(21.5);
  const safeCps = Array(72).fill(4.4);

  for (let i = 0; i < 70; i += 2) {
    const qOffset = Math.floor(Math.random() * 4) + 1;
    safeScores[i] += qOffset;
    safeScores[i+1] -= qOffset;

    const lOffset = parseFloat((Math.random() * 0.03 + 0.01).toFixed(2));
    safeListening[i] = parseFloat((safeListening[i] + lOffset).toFixed(2));
    safeListening[i+1] = parseFloat((safeListening[i+1] - lOffset).toFixed(2));

    const eOffset = parseFloat((Math.random() * 5.0 + 1.0).toFixed(1));
    safeEdits[i] = parseFloat((safeEdits[i] + eOffset).toFixed(1));
    safeEdits[i+1] = parseFloat((safeEdits[i+1] - eOffset).toFixed(1));

    const cOffset = parseFloat((Math.random() * 0.8 + 0.2).toFixed(1));
    safeCps[i] = parseFloat((safeCps[i] + cOffset).toFixed(1));
    safeCps[i+1] = parseFloat((safeCps[i+1] - cOffset).toFixed(1));
  }

  // Warning parameters prep: targets average 70% Quality, 66% Listening, 11.5% Edits, 6.4 CPS
  const warnScores = Array(18).fill(70);
  const warnListening = Array(18).fill(0.66);
  const warnEdits = Array(18).fill(11.5);
  const warnCps = Array(18).fill(6.4);

  for (let i = 0; i < 16; i += 2) {
    const qOffset = Math.floor(Math.random() * 6) + 1;
    warnScores[i] += qOffset;
    warnScores[i+1] -= qOffset;

    const lOffset = parseFloat((Math.random() * 0.08 + 0.02).toFixed(2));
    warnListening[i] = parseFloat((warnListening[i] + lOffset).toFixed(2));
    warnListening[i+1] = parseFloat((warnListening[i+1] - lOffset).toFixed(2));

    const eOffset = parseFloat((Math.random() * 3.0 + 1.0).toFixed(1));
    warnEdits[i] = parseFloat((warnEdits[i] + eOffset).toFixed(1));
    warnEdits[i+1] = parseFloat((warnEdits[i+1] - eOffset).toFixed(1));

    const cOffset = parseFloat((Math.random() * 0.8 + 0.1).toFixed(1));
    warnCps[i] = parseFloat((warnCps[i] + cOffset).toFixed(1));
    warnCps[i+1] = parseFloat((warnCps[i+1] - cOffset).toFixed(1));
  }

  // Blocked parameters prep: targets average 50% Quality, 44.4% Listening, 4.5% Edits, 8.8 CPS
  const blockedScores = Array(10).fill(50);
  const blockedListening = Array(10);
  for (let i = 0; i < 6; i++) blockedListening[i] = 0.44;
  for (let i = 6; i < 10; i++) blockedListening[i] = 0.45;

  const blockedEdits = Array(10).fill(4.5);
  const blockedCps = Array(10).fill(8.8);

  for (let i = 0; i < 8; i += 2) {
    const qOffset = Math.floor(Math.random() * 5) + 1;
    blockedScores[i] += qOffset;
    blockedScores[i+1] -= qOffset;

    const lOffset = parseFloat((Math.random() * 0.04 + 0.01).toFixed(2));
    blockedListening[i] = parseFloat((blockedListening[i] + lOffset).toFixed(2));
    blockedListening[i+1] = parseFloat((blockedListening[i+1] - lOffset).toFixed(2));

    const eOffset = parseFloat((Math.random() * 1.5 + 0.5).toFixed(1));
    blockedEdits[i] = parseFloat((blockedEdits[i] + eOffset).toFixed(1));
    blockedEdits[i+1] = parseFloat((blockedEdits[i+1] - eOffset).toFixed(1));

    const cOffset = parseFloat((Math.random() * 1.2 + 0.2).toFixed(1));
    blockedCps[i] = parseFloat((blockedCps[i] + cOffset).toFixed(1));
    blockedCps[i+1] = parseFloat((blockedCps[i+1] - cOffset).toFixed(1));
  }

  // Generate 72 Safe contributors
  for (let i = 0; i < 72; i++) {
    const name = safeNames[i] || `Safe Contributor ${i + 1}`;
    const id = `C-SAFE-${1000 + i}`;
    
    const listeningRatio = safeListening[i];
    const editRate = safeEdits[i];
    const charactersPerSecond = safeCps[i];
    const typingSpeed = Math.round(charactersPerSecond * 60 / 5);
    const qualityScore = safeScores[i];
    
    const accuracy = Math.round((92 + Math.random() * 7.5) * 10) / 10; 
    const copyPasteCount = 0;
    const tabSwitches = Math.floor(Math.random() * 2);
    
    const completedTasks = Math.floor(120 + Math.random() * 230); // 120 to 350
    const previousWarnings = 0;

    list.push({
      id,
      name,
      avatar: getInitials(name),
      qualityScore,
      status: 'safe',
      accuracy,
      joinedDate: 'Jan 15, 2026',
      dateCreated: getPastDate(Math.floor(Math.random() * 7)),
      completedTasks,
      previousWarnings,
      metrics: {
        typingSpeed,
        charactersPerSecond,
        copyPasteCount,
        tabSwitches,
        pauseFrequency: Math.round((3.0 + Math.random() * 2.0) * 10) / 10,
        playbackSpeed: Math.round((1.0 + Math.random() * 0.2) * 10) / 10,
        silenceSkips: Math.floor(Math.random() * 6) + 1,
        editRate,
        listeningRatio,
        scrubCount: Math.floor(Math.random() * 8) + 3,
        totalAudioDuration: Math.floor(200 + Math.random() * 800),
        totalWorkingTime: Math.floor(250 + Math.random() * 900)
      },
      timeline: [
        { time: '00:00', event: 'Audio Loaded', details: 'Snippet initialized', type: 'system' },
        { time: '00:02', event: 'Audio Play', details: 'Playback started', type: 'audio' },
        { time: '00:10', event: 'Typing Initiated', details: `Typing cadence established at ${typingSpeed} WPM`, type: 'typing' }
      ],
      recentSubmissions: [
        { id: `SUB-S-${i}`, audioTitle: 'General Interview Snippet', submittedText: 'Yes, I think we can proceed with the standard plan...', duration: '1:30', timestamp: '2 hours ago', date: getPastDate(0), riskTriggered: null }
      ]
    });
  }

  // Generate 18 Warning contributors
  for (let i = 0; i < 18; i++) {
    const name = warningNames[i] || `Warning Contributor ${i + 1}`;
    const id = `C-WARN-${2000 + i}`;
    
    const listeningRatio = warnListening[i];
    const editRate = warnEdits[i];
    const charactersPerSecond = warnCps[i];
    const typingSpeed = Math.round(charactersPerSecond * 60 / 5);
    const qualityScore = warnScores[i];
    
    const accuracy = Math.round((75 + Math.random() * 15) * 10) / 10; 
    const copyPasteCount = Math.floor(Math.random() * 3) + 2; 
    const tabSwitches = Math.floor(Math.random() * 5) + 3; 

    const completedTasks = Math.floor(40 + Math.random() * 140); // 40 to 180
    const previousWarnings = Math.floor(Math.random() * 2) + 1; // 1 or 2

    list.push({
      id,
      name,
      avatar: getInitials(name),
      qualityScore,
      status: 'warning',
      accuracy,
      joinedDate: 'Feb 10, 2026',
      dateCreated: getPastDate(Math.floor(Math.random() * 7)),
      completedTasks,
      previousWarnings,
      metrics: {
        typingSpeed,
        charactersPerSecond,
        copyPasteCount,
        tabSwitches,
        pauseFrequency: Math.round((1.0 + Math.random() * 1.5) * 10) / 10,
        playbackSpeed: Math.round((1.2 + Math.random() * 0.4) * 10) / 10,
        silenceSkips: Math.floor(Math.random() * 12) + 6,
        editRate,
        listeningRatio,
        scrubCount: Math.floor(Math.random() * 18) + 8,
        totalAudioDuration: Math.floor(100 + Math.random() * 400),
        totalWorkingTime: Math.floor(120 + Math.random() * 500)
      },
      timeline: [
        { time: '00:00', event: 'Audio Loaded', details: 'Snippet initialized', type: 'system' },
        { time: '00:01', event: 'Clipboard Paste', details: `Pasted ${copyPasteCount} blocks of text`, type: 'clipboard' },
        { time: '00:08', event: 'Tab Focus Lost', details: `Switched tab ${tabSwitches} times`, type: 'focus' }
      ],
      recentSubmissions: [
        { id: `SUB-W-${i}`, audioTitle: 'Customer Feedback #22', submittedText: 'We should definitely consider changing the colors because they are...', duration: '2:10', timestamp: '5 hours ago', date: getPastDate(0), riskTriggered: 'Pasted text detected' }
      ]
    });
  }

  // Generate 10 Blocked contributors
  for (let i = 0; i < 10; i++) {
    const name = blockedNames[i] || `Blocked Contributor ${i + 1}`;
    const id = `C-BLOCK-${3000 + i}`;
    
    const listeningRatio = blockedListening[i];
    const editRate = blockedEdits[i];
    const charactersPerSecond = blockedCps[i];
    const typingSpeed = Math.round(charactersPerSecond * 60 / 5);
    const qualityScore = blockedScores[i];
    
    const accuracy = Math.round((40 + Math.random() * 25) * 10) / 10; 
    const copyPasteCount = Math.floor(Math.random() * 5) + 5; 
    const tabSwitches = Math.floor(Math.random() * 10) + 10; 

    const completedTasks = Math.floor(15 + Math.random() * 75); // 15 to 90
    const previousWarnings = Math.floor(Math.random() * 2) + 3; // 3 or 4

    list.push({
      id,
      name,
      avatar: getInitials(name),
      qualityScore,
      status: 'blocked',
      accuracy,
      joinedDate: 'Mar 01, 2026',
      dateCreated: getPastDate(Math.floor(Math.random() * 7)),
      completedTasks,
      previousWarnings,
      metrics: {
        typingSpeed,
        charactersPerSecond,
        copyPasteCount,
        tabSwitches,
        pauseFrequency: 0.2,
        playbackSpeed: 1.0,
        silenceSkips: Math.floor(Math.random() * 25) + 10,
        editRate,
        listeningRatio,
        scrubCount: Math.floor(Math.random() * 30) + 15,
        totalAudioDuration: Math.floor(300 + Math.random() * 500),
        totalWorkingTime: Math.floor(50 + Math.random() * 80)
      },
      timeline: [
        { time: '00:00', event: 'Audio Loaded', details: 'Snippet initialized', type: 'system' },
        { time: '00:01', event: 'Clipboard Paste', details: 'Pasted 940 characters instantly', type: 'clipboard' },
        { time: '00:03', event: 'Audio Scrubber Moved', details: 'Scrubbed to 100% audio length in 2 seconds', type: 'audio' }
      ],
      recentSubmissions: [
        { id: `SUB-B-${i}`, audioTitle: 'Call Recording Spam', submittedText: 'Hello world sample text copy paste from file system output log folder...', duration: '4:50', timestamp: '1 day ago', date: getPastDate(1), riskTriggered: 'Critical robotic input signature' }
      ]
    });
  }

  return list;
};

// Initial Alerts
const initialAlerts: Alert[] = [
  {
    id: 'alert-1',
    contributorId: 'C-WARN-2000',
    contributorName: 'Alex Rivera',
    ruleName: 'Copy-Paste Detection',
    timestamp: '4 mins ago',
    severity: 'high',
    read: false,
    value: '4 pastes in 2 mins'
  },
  {
    id: 'alert-2',
    contributorId: 'C-BLOCK-3000',
    contributorName: 'Sophia Patel',
    ruleName: 'Copy-Paste Detection',
    timestamp: '2 mins ago',
    severity: 'critical',
    read: false,
    value: '8 pastes in 1 min'
  }
];

// Pre-populated exactly 10 realistic AI Recommendations matching user parameters
const initialRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    contributorId: 'C-BLOCK-3000',
    contributorName: 'Sophia Patel',
    riskScore: 60,
    listeningRatio: 0.35,
    editRate: 2.1,
    charactersPerSecond: 9.8,
    detectionReason: 'Robotic clipboard activity detected. Large text snippets pasted 9 times inside editor with near-zero keyboard timings variance.',
    action: 'Block User',
    priority: 'critical',
    status: 'pending',
    timestamp: '10 mins ago'
  },
  {
    id: 'rec-2',
    contributorId: 'C-BLOCK-3001',
    contributorName: 'Robert Vance',
    riskScore: 58,
    listeningRatio: 0.38,
    editRate: 2.4,
    charactersPerSecond: 10.2,
    detectionReason: 'Keystroke timing distribution matches automated macro transcription assistant script. Human physical typing speed limit exceeded.',
    action: 'Block User',
    priority: 'critical',
    status: 'pending',
    timestamp: '32 mins ago'
  },
  {
    id: 'rec-3',
    contributorId: 'C-WARN-2000',
    contributorName: 'Alex Rivera',
    riskScore: 38,
    listeningRatio: 0.54,
    editRate: 6.8,
    charactersPerSecond: 5.8,
    detectionReason: 'Frequent browser focus switches (exited transcription viewport 7 times) during active play segment with skips in silent zones.',
    action: 'Send Warning',
    priority: 'medium',
    status: 'pending',
    timestamp: '1 hour ago'
  },
  {
    id: 'rec-4',
    contributorId: 'C-WARN-2001',
    contributorName: 'David Miller',
    riskScore: 35,
    listeningRatio: 0.61,
    editRate: 32.4,
    charactersPerSecond: 7.2,
    detectionReason: 'Extremely high typographical editing rate (32.4% backspaces) indicating manual cleanup of distorted OCR script inputs.',
    action: 'Manual Review',
    priority: 'high',
    status: 'pending',
    timestamp: '2 hours ago'
  },
  {
    id: 'rec-5',
    contributorId: 'C-WARN-2002',
    contributorName: 'John Doe',
    riskScore: 40,
    listeningRatio: 0.51,
    editRate: 7.4,
    charactersPerSecond: 6.1,
    detectionReason: 'Playback speed acceleration bypass. Skipped forward over 4 silence flags without playing corresponding audio.',
    action: 'Send Warning',
    priority: 'medium',
    status: 'pending',
    timestamp: '4 hours ago'
  },
  {
    id: 'rec-6',
    contributorId: 'C-BLOCK-3002',
    contributorName: 'James Kelly',
    riskScore: 55,
    listeningRatio: 0.41,
    editRate: 3.1,
    charactersPerSecond: 11.2,
    detectionReason: 'Anomalous typing burst speeds exceeding 11 characters per second (CPS) sustained for more than 40 seconds.',
    action: 'Temporary Suspend',
    priority: 'high',
    status: 'pending',
    timestamp: '6 hours ago'
  },
  {
    id: 'rec-7',
    contributorId: 'C-WARN-2003',
    contributorName: 'Priya Nair',
    riskScore: 32,
    listeningRatio: 0.68,
    editRate: 9.8,
    charactersPerSecond: 5.6,
    detectionReason: 'Duplicated transcription segments submitted across unrelated dialogue audio recordings (cross-file template patterns).',
    action: 'Manual Review',
    priority: 'medium',
    status: 'pending',
    timestamp: '12 hours ago'
  },
  {
    id: 'rec-8',
    contributorId: 'C-BLOCK-3003',
    contributorName: 'Clara Oswald',
    riskScore: 52,
    listeningRatio: 0.43,
    editRate: 3.8,
    charactersPerSecond: 11.9,
    detectionReason: 'Tab focus telemetry indicates that browser was minimized or blurred for 82% of active audio translation time.',
    action: 'Temporary Suspend',
    priority: 'high',
    status: 'pending',
    timestamp: '1 day ago'
  },
  {
    id: 'rec-9',
    contributorId: 'C-WARN-2004',
    contributorName: 'Kenji Sato',
    riskScore: 28,
    listeningRatio: 0.72,
    editRate: 10.4,
    charactersPerSecond: 5.9,
    detectionReason: 'Variance in manual spot verification checks reveals transcription accuracy drops below 80% on phonetic homophones.',
    action: 'Send Warning',
    priority: 'low',
    status: 'pending',
    timestamp: '1 day ago'
  },
  {
    id: 'rec-10',
    contributorId: 'C-BLOCK-3004',
    contributorName: 'Buster Bot',
    riskScore: 59,
    listeningRatio: 0.36,
    editRate: 2.1,
    charactersPerSecond: 11.8,
    detectionReason: 'Constant timing interval pattern detected between alphanumeric keyups, indicating synthetic loop typist macros.',
    action: 'Block User',
    priority: 'critical',
    status: 'pending',
    timestamp: '2 days ago'
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rules, setRules] = useState<DetectionRule[]>(initialRules);
  const [contributors, setContributors] = useState<Contributor[]>(generateContributors());
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations);

  // Function to calculate dynamic risk scores based on rules
  const calculateQualityScores = (currentContributors: Contributor[], currentRules: DetectionRule[]) => {
    return currentContributors.map(contributor => {
      let riskVal = 0;
      let totalWeights = 0;

      // 1. Listening Ratio (percentage, e.g. < 70)
      const ruleLr = currentRules.find(r => r.id === 'rule-listening-ratio');
      if (ruleLr && ruleLr.isEnabled) {
        totalWeights += ruleLr.weight;
        const listenPct = contributor.metrics.listeningRatio * 100;
        if (listenPct < ruleLr.threshold) {
          const diff = ruleLr.threshold - listenPct;
          const ratio = Math.min(diff / 25, 2);
          riskVal += ruleLr.weight * 10 * ratio;
        }
      }

      // 2. Edit Rate (percentage, e.g. < 10)
      const ruleEr = currentRules.find(r => r.id === 'rule-edit-rate');
      if (ruleEr && ruleEr.isEnabled) {
        totalWeights += ruleEr.weight;
        if (contributor.metrics.editRate < ruleEr.threshold) {
          const diff = ruleEr.threshold - contributor.metrics.editRate;
          const ratio = Math.min(diff / 5, 2);
          riskVal += ruleEr.weight * 10 * ratio;
        }
      }

      // 3. Characters Per Second (absolute value, e.g. > 8)
      const ruleCps = currentRules.find(r => r.id === 'rule-cps-limit');
      if (ruleCps && ruleCps.isEnabled) {
        totalWeights += ruleCps.weight;
        if (contributor.metrics.charactersPerSecond > ruleCps.threshold) {
          const diff = contributor.metrics.charactersPerSecond - ruleCps.threshold;
          const ratio = Math.min(diff / 2, 2);
          riskVal += ruleCps.weight * 10 * ratio;
        }
      }

      // 4. Repeated Suspicious Behavior (absolute value, e.g. > 3 tasks / warnings)
      const ruleRep = currentRules.find(r => r.id === 'rule-repeated-suspicious');
      if (ruleRep && ruleRep.isEnabled) {
        totalWeights += ruleRep.weight;
        const incidents = contributor.previousWarnings + (contributor.metrics.copyPasteCount > 0 ? 1 : 0);
        if (incidents > ruleRep.threshold) {
          const diff = incidents - ruleRep.threshold;
          const ratio = Math.min(diff / 2, 2);
          riskVal += ruleRep.weight * 10 * ratio;
        }
      }

      let finalRisk = 0;
      if (totalWeights > 0) {
        const maxExpectedValue = totalWeights * 14; 
        finalRisk = Math.min(Math.round((riskVal / maxExpectedValue) * 100), 100);
      }

      // Quality Score is 100 - riskScore. Range is strictly 40–100.
      const qualityScore = Math.max(40, 100 - finalRisk);

      // Re-map Status boundaries to 80/60
      let status: Contributor['status'] = 'safe';
      if (qualityScore < 60) {
        status = 'blocked';
      } else if (qualityScore < 80) {
        status = 'warning';
      }

      return {
        ...contributor,
        qualityScore,
        status
      };
    });
  };

  // Recalculate whenever rules change
  useEffect(() => {
    setContributors(prev => calculateQualityScores(prev, rules));
  }, [rules]);

  // Actions
  const toggleRule = (id: string) => {
    setRules(prev =>
      prev.map(rule => (rule.id === id ? { ...rule, isEnabled: !rule.isEnabled } : rule))
    );
  };

  const updateRuleThreshold = (id: string, threshold: number) => {
    setRules(prev =>
      prev.map(rule => (rule.id === id ? { ...rule, threshold } : rule))
    );
  };

  const updateRuleWeight = (id: string, weight: number) => {
    setRules(prev =>
      prev.map(rule => (rule.id === id ? { ...rule, weight } : rule))
    );
  };

  const flagContributor = (id: string, status: Contributor['status']) => {
    setContributors(prev =>
      prev.map(c => {
        if (c.id === id) {
          let score = c.qualityScore;
          if (status === 'blocked') score = Math.max(40, Math.min(score, 59));
          if (status === 'warning') score = Math.max(60, Math.min(score, 79));
          if (status === 'safe') score = Math.max(80, score);
          return {
            ...c,
            status,
            qualityScore: score
          };
        }
        return c;
      })
    );
    setAlerts(prev => prev.map(a => a.contributorId === id ? { ...a, read: true } : a));
  };

  const executeRecommendation = (id: string, actionResult: 'approved' | 'blocked') => {
    setRecommendations(prev =>
      prev.map(rec => (rec.id === id ? { ...rec, status: actionResult } : rec))
    );

    const rec = recommendations.find(r => r.id === id);
    if (rec) {
      const targetStatus = actionResult === 'blocked' || rec.action === 'Block User' ? 'blocked' : 'warning';
      flagContributor(rec.contributorId, targetStatus);
    }
  };

  const snoozeRecommendation = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec => (rec.id === id ? { ...rec, status: 'approved' } : rec))
    );
  };

  const addCustomRule = (newRule: Omit<DetectionRule, 'id' | 'isEnabled'>) => {
    const id = `rule-custom-${Date.now()}`;
    setRules(prev => [
      ...prev,
      {
        ...newRule,
        id,
        isEnabled: true,
        explanation: 'Custom defined heuristic trigger condition.',
        recommendedAction: 'Flag for manual operator review.',
        severity: 'medium'
      },
    ]);
  };

  const markAllAlertsAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  return (
    <div className="provider-wrapper">
      <DataContext.Provider
        value={{
          contributors,
          rules,
          alerts,
          recommendations,
          toggleRule,
          updateRuleThreshold,
          updateRuleWeight,
          flagContributor,
          executeRecommendation,
          snoozeRecommendation,
          addCustomRule,
          markAllAlertsAsRead,
        }}
      >
        {children}
      </DataContext.Provider>
    </div>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
