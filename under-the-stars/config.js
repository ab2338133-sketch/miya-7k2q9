/* ==========================================================================
   UNDER THE STARS — configuration
   Everything personal lives here: names, words, music and photo paths.
   You can edit this file without touching the rest of the code.

   Tokens you can use inside any text:
     {her}  -> herName        {me}  -> myName
   ========================================================================== */

window.CONFIG = {
  myName: 'Abdulhakim',
  herName: 'Miya',

  title: 'Under the Stars',
  subtitle: 'A Little Universe Made for {her}',

  /* ---- Music -----------------------------------------------------------
     The song plays through YouTube's official embedded player. Nothing is
     downloaded or copied. To change the song, replace youtubeId with the
     11-character ID from the official video's address
     (youtube.com/watch?v=THIS_PART) and update watchUrl.
     bpm only controls the gentle pulse of the stars while music plays.   */
  music: {
    title: 'Perfect',
    artist: 'Ed Sheeran',
    youtubeId: '2Vv-BfVoq4g',
    watchUrl: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
    startVolume: 60,
    bpm: 63,
    eyebrow: 'Now playing',
    hint: 'If the music has not started, press play on the video.',
    fallbackText: 'The player could not load here. You can listen to the official song on YouTube instead.',
    fallbackButton: 'Listen on YouTube',
    continue: 'Continue'
  },

  /* ---- Photographs ----------------------------------------------------- */
  photos: {
    her: [
      { src: 'assets/miya-photo-1.jpg', alt: '{her}, first photograph' },
      { src: 'assets/miya-photo-2.jpg', alt: '{her}, second photograph' },
      { src: 'assets/miya-photo-3.jpg', alt: '{her}, third photograph' }
    ],
    // Used together in "Our Little Universe". Change the paths to swap photos.
    duoHer: 'assets/miya-photo-2.jpg',
    duoMe: 'assets/abdulhakim-photo.jpg'
    // Spare portrait of you, not used by default: assets/abdulhakim-photo-2.jpg
  },

  /* ---- Scene 1 · The opening ------------------------------------------ */
  opening: {
    line1: 'Somewhere beneath a million stars, there is someone who makes my world brighter.',
    line2: '{her}, this little universe is yours.',
    button: 'Open Your Surprise'
  },

  /* ---- Scene 3 · Her photograph reveal -------------------------------- */
  reveal: {
    line: 'Of all the beautiful things in this world, you are my favorite.',
    continue: 'Continue'
  },

  /* ---- Scene 4 · Our little universe ---------------------------------- */
  universe: {
    title: '{me} & {her}',
    caption: 'Two stars, one sky.',
    continue: 'Continue'
  },

  /* ---- Scene 5 · The letter ------------------------------------------- */
  letter: {
    eyebrow: 'A letter',
    closedLabel: 'For {her}',
    button: 'Read My Words',
    continue: 'Continue',
    paragraphs: [
      'Dear {her},',
      'Happy anniversary.',
      'I wanted to give you something that exists only for you, so I built you a little universe. It is small, but every star in it is here because of you.',
      'Thank you for being exactly who you are. You have a way of making my days lighter, and I am more grateful for that than I know how to say.',
      'I admire your kindness, and the way you carry yourself with such grace. It is one of the things I appreciate most about you.',
      'I will not promise you the sky. I only want you to know that I see you, I am proud of you, and out of all the paths in this wide world, I am so glad ours crossed.',
      'Happy anniversary, {her}.',
      'Yours,\n{me}'
    ]
  },

  /* ---- Scene 6 · Original dedication ---------------------------------- */
  dedication: {
    eyebrow: 'A dedication',
    note: 'Original words written for {her}. Not lyrics from the song.',
    next: 'Next',
    continue: 'Continue',
    // types: opening | verse | refrain | closing
    stanzas: [
      { type: 'opening', lines: [
        'Before the morning finds the sky,',
        'let me tell the stars your name.'
      ]},
      { type: 'verse', lines: [
        'I used to count the lights above me,',
        'never guessing one would stay,',
        'then you arrived, soft as moonrise,',
        'and the dark learned how to glow.'
      ]},
      { type: 'verse', lines: [
        'Let the years be slow and gentle,',
        'let the road run wide and long,',
        'I’ll keep a lantern lit beside you',
        'for as far as we can go.'
      ]},
      { type: 'refrain', lines: [
        '{her}, you’re my morning star, my midnight sky,',
        'every road I take leads back to your light.'
      ]},
      { type: 'closing', lines: [
        'Under all these stars, I’m so glad it’s you.'
      ]}
    ]
  },

  /* ---- Scene 7 · Final surprise --------------------------------------- */
  finale: {
    line1: '{her}, you are my favorite part of this beautiful journey.',
    line2: 'Forever grateful that our paths crossed.',
    signoff: ['With love,', '{me}'],
    replay: 'Replay'
  },

  /* ---- Small interface labels ----------------------------------------- */
  ui: {
    sceneNames: ['Opening', 'Music', 'Photographs', 'Us', 'Letter', 'Dedication', 'Finale']
  }
};
