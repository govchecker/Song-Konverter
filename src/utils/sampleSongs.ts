/**
 * Sample Ultimate Guitar songs for quick loading and testing
 */

export interface SampleSong {
  id: string;
  title: string;
  artist: string;
  description: string;
  content: string;
}

export const SAMPLE_SONGS: SampleSong[] = [
  {
    id: 'incubus-drive',
    title: 'Drive',
    artist: 'Incubus',
    description: 'Das Beispiellied aus der Aufgabenstellung mit Intro, Versen, Pre-Chorus, Solo und Outro.',
    content: `Incubus - Drive

[Intro]
Em    Em7   Cmaj7    A7
Em    Em7   Cmaj7    A7

[Verse]
Em      Em7    Cmaj7      A7       Em                     Em7    Cmaj7    A7
Sometimes, I feel the fear of un---certainty stinging clear
Em    Em7   Cmaj7                   A7
And I can't help but ask myself how much
       Em                    Em7     Cmaj7    A7
I'll let the fear take the wheel and steer.

[Pre-Chorus]
Cmaj7             A7                             Cmaj9   A7
It's driven me before, and it seems to have a vague -----haunting mass appeal.
Cmaj7          A7                        Cmaj9             A7
But lately I'm beginning to find that I------should be the one behind the wheel.

[Chorus]
Em       Em7  Cmaj7         A7     Em
Whatever tomorrow brings, I'll be there
  Em7     Cmaj7                A7
with open arms and open eyes, Yeah
  Em     Em7  Cmaj7          A7                 Em   Em7   Cmaj7  A7
Whatever tomorrow brings, I'll be there..I'll be there.

[Verse]
Em     Em7    Cmaj7             A7        Em               Em7  Cmaj7  A7
So, if I de---cide to waiver my chance to be one of the hive
Em    Em7     Cmaj7               A7      Em             Em7    Cmaj7   A7
Will I choose water over wine and hold my own and drive? Ahaa-aa-aa-aa.

[Pre-Chorus]
Cmaj7            A7                            Cmaj9       A7
It's driven me before and it seems to be the way that everyone else gets around.
Cmaj7      A7                             Cmaj9       A7
But lately I'm beginning to find that when I drive myself my light is found.

[Chorus]
Em       Em7  Cmaj7         A7     Em
Whatever tomorrow brings, I'll be there
  Em7     Cmaj7                A7
with open arms and open eyes, Yeah
  Em     Em7  Cmaj7          A7                 Em   Em7   Cmaj7  A7
Whatever tomorrow brings, I'll be there--------------I'll be there.

[Solo]
Em    Em7   Cmaj7    A7
Em    Em7   Cmaj7    A7
Em    Em7   Cmaj7    A7
Em    Em7   Cmaj7    A7

[Bridge]
Cmaj7     A7                    Cmaj9   A7                        N.C.
Would you choose water over wine--------hold the wheel and drive?

[Chorus]
Em       Em7  Cmaj7         A7     Em
Whatever tomorrow brings, I'll be there
  Em7     Cmaj7                A7
with open arms and open eyes, Yeah
  Em     Em7  Cmaj7          A7                Em   Em7   Cmaj7  A7
Whatever tomorrow brings, I'll be there--------------I'll be there.

Em    Em7   Cmaj7    A7
-------Do do do do do do do do do do do (x4)

[Outro]
Cmaj7    A7`,
  },
  {
    id: 'eagles-hotel-california',
    title: 'Hotel California',
    artist: 'Eagles',
    description: 'Klassiker mit Akkorden und Textzeilen',
    content: `Eagles - Hotel California
Capo: 7th fret

[Intro]
Am   E7   G   D   F   C   Dm   E7

[Verse 1]
Am                             E7
On a dark desert highway, cool wind in my hair
G                           D
Warm smell of colitas rising up through the air
F                               C
Up ahead in the distance, I saw a shimmering light
Dm                                          E7
My head grew heavy and my sight grew dim, I had to stop for the night

[Chorus]
F                          C
Welcome to the Hotel California
       E7                                       Am
Such a lovely place (such a lovely place), such a lovely face
F                               C
Plenty of room at the Hotel California
    Dm                                      E7
Any time of year (any time of year), you can find it here`,
  },
  {
    id: 'bob-dylan-knockin',
    title: "Knockin' On Heaven's Door",
    artist: 'Bob Dylan',
    description: 'Einfacher Standard-Song mit G - D - Am und G - D - C Progression',
    content: `Bob Dylan - Knockin' On Heaven's Door
Key: G

[Intro]
G   D   Am
G   D   C

[Verse 1]
G           D              Am
Mama, take this badge off of me
G           D          C
I can't use it anymore
G                    D            Am
It's gettin' dark, too dark for me to see
G            D                  C
I feel like I'm knockin' on heaven's door

[Chorus]
G             D                    Am
Knock, knock, knockin' on heaven's door
G             D                    C
Knock, knock, knockin' on heaven's door
G             D                    Am
Knock, knock, knockin' on heaven's door
G             D                    C
Knock, knock, knockin' on heaven's door`,
  },
  {
    id: 'tab-bass-riff',
    title: 'Bass Riff Tabulatur',
    artist: 'Beispiel Tabulatur',
    description: 'Demonstriert automatische {start_of_tab} Erkennung und Monospace-Darstellung',
    content: `Beispiel Tabulatur - Bass Riff
Key: Em

[Intro]
Em    G    Am    C

[Tabulatur]
G |----------------------------|-----7--5--7L-7-------------|
D |-----7--5--7L-7-------------|-----------------7--5-------|
A |-----------------7--5-------|--5--------------------8----|
E |--5--------------------8----|----------------------------|

----------------------------------------------------||
--------7-----5-----7L----7-----5h-7----------------||
--------------------------------------7-----5-------||
--5-------------------------------------------------||

[Verse]
Em                      G
Playing this bassline with perfect tab width
Am                     C
Every single character is aligned on screen`,
  }
];
