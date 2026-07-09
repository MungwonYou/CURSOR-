/** Organization chart data (names & structure from company profile) */
const ORG_DATA = {
  taehwa: {
    chairman: 'Mr. Choi W.H',
    viceChairman: 'Mr. Cho U.H',
    centers: [
      { id: 'planning', key: 'businessPlanning' },
      { id: 'technical', key: 'technicalSupport' },
    ],
    domestic: [
      { key: 'rnd', count: 2, items: ['Press Mold & Die (GIM-HAE)', 'Electric Motor & Products (Kwangju)'] },
      { key: 'ship', count: 2, items: ['TMC', 'Shinhan Heavy'] },
      { key: 'electric', count: 5, items: ['Taehwa', 'Hangnam', 'Dongseo Elec.', 'Hanam', 'NewMotech'] },
    ],
    overseas: {
      count: 16,
      regions: [
        { country: 'CHINA', items: ['TAIXIN - Tianjin', 'TAIXIN - Suzhou', 'G.TEC - Suzhou', 'GREEN PRECISION - Suzhou', 'TAIXIN PRECISION - Ningbo'] },
        { country: 'THAILAND', items: ['THAI NewMotech', 'THAI Hanam'] },
        { country: 'MEXICO', items: ['NewMotech MEX', 'TaeHwa MEX'] },
        { country: 'VIETNAM', items: ['Hanam VINA', 'NewHanam VINA', 'Hangnam VINA'], highlight: 'NewHanam VINA' },
        { country: 'INDIA', items: ['Taehwa India', 'Hanam India'] },
        { country: 'INDONESIA', items: ['Taehang Indonesia'] },
        { country: 'POLAND', items: ['Taehwa Poland'] },
      ],
    },
  },
  newhanam: {
    effectiveDate: '2026.05~',
    headcount: {
      total: 395,
      admin: [
        ['Korea', 3], ['HR', 12], ['Acc', 7], ['Pur', 7], ['Sales', 3], ['R&D', 4], ['Inno', 3], ['Plan', 3],
      ],
      production1: {
        total: 47,
        items: [['DD Motor', 24], ['Main Line', 39], ['Press', 18], ['W/M', 24], ['Duct ass\'y', 3]],
      },
      production2: {
        total: 28,
        items: [['Stator', 46], ['Motor Fan', 23], ['Motor Part', 23], ['APS', 25]],
      },
      support: [
        ['F. Goods WH', 23], ['Material WH', 15], ['Engineer', 10], ['Mold', 9], ['QC', 13],
      ],
    },
    gm: { name: 'KIM SC', subtitle: 'New Hanam Vina' },
    teams: [
      {
        key: 'productionTeam',
        leader: { rankKey: 'seniorManager', name: 'LEE MC' },
        tone: 'prod',
        units: [
          {
            key: 'prodTeam1',
            leader: { rankKey: 'manager', name: 'HAI' },
            tasks: ['Injection-CANH', 'Main Line-HAN', 'DD Motor-MANH', 'Press-TAO/KIEN', 'WM-TUNG/NHON'],
          },
          {
            key: 'prodTeam2',
            leader: { rankKey: 'manager', name: 'HUNG' },
            tasks: ['DC Motor-LONG', 'Stator-PHONG', 'Sub-assembly-LINH', 'AP3/NKS-TUNG'],
          },
          {
            key: 'prodControl',
            leader: { rankKey: 'asstManager', name: 'TUAN' },
            tasks: ['Production planning', 'Weekly production plan I/UP', 'Weekly OT plan I/UP'],
          },
        ],
      },
      {
        key: 'supportTeam',
        leader: { rankKey: 'manager', name: 'LEE JI' },
        tone: 'support',
        units: [
          { key: 'engineering', leader: { rankKey: 'asstManager', name: 'TINH' }, tasks: ['Equipment PM', 'Equipment PM-HUY'] },
          { key: 'mold', leader: { rankKey: 'asstManager', name: 'TRONG' }, tasks: ['Press mold PM', 'Injection mold PM'] },
          { key: 'salesTeam', leader: { rankKey: 'manager', name: 'THEM' }, tasks: ['SOP reception', 'Customer response', 'Customer delivery TRUONG'] },
          { key: 'qc', leader: { rankKey: 'supervisor', name: 'PHUOC' }, tasks: ['QA-DEP', 'IQC-TUAN', 'Audi QC-CA', 'Injection OQC-HUNG'] },
          { key: 'rndUnit', leader: { rankKey: 'asstManager', name: 'VU' }, tasks: ['New model I/UP'] },
          {
            key: 'innovation',
            leader: { rankKey: 'deputyManager', name: 'TU' },
            tasks: ['HQ projects I/U', 'New Hanam Innovation I/U-NGA', 'ERP/Export-LINH', 'Improvement & Maintenance-CAN'],
          },
        ],
      },
      {
        key: 'managementTeam',
        leader: null,
        tone: 'mgmt',
        units: [
          {
            key: 'purchasing',
            leader: { rankKey: 'asstManager', name: 'TUYET' },
            tasks: ['Material purchase management', 'General purchase management', 'Press logistics-NHUT', 'JNJ logistics-PHUOC'],
          },
          {
            key: 'accounting',
            leader: { rankKey: 'deputyManager', name: 'HIEN' },
            tasks: ['Accounting', 'Import/Export-TRINH', 'General accounting-HOA'],
          },
          {
            key: 'hrga',
            leader: { rankKey: 'asstManager', name: 'DUY' },
            tasks: ['HR', 'General Affairs', 'IT/Systems'],
          },
        ],
      },
    ],
  },
};
