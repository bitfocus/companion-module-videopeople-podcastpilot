# PodcastPilot

Controls [PodcastPilot](https://podcastpilot.app) — multicam podcast recording
for Mac with SDI (Blackmagic DeckLink), NDI® and USB sources.

## Setup

1. In PodcastPilot, open **Settings → Remote** and make sure **Enable control
   API** is on (it is by default).
2. **Companion on the same Mac:** host `127.0.0.1`, port `9720`, leave the
   token empty. Done.
3. **Companion on another machine:** enable **Allow connections from other
   devices** in PodcastPilot, then copy the token shown in the app into the
   module config.

Requires PodcastPilot 0.9.50 or later.

## What you get

**Actions:** cut/fade to source, record start/stop/toggle, drop any of your
predefined markers, fire the frame-accurate sync slate, set or nudge track
volume (dB), mute/solo, monitor volume, default transition, soundboard
play/toggle/stop.

**Feedbacks:** source on program (tally), recording active, track muted/soloed,
source signal lost, sound playing.

**Variables:** timecode, elapsed, dropped frames, session name, program source,
source/track names and gains, sound names, the playing sound and its remaining
time — plus per-track levels (dBFS) if you enable "Track levels as variables".

**Presets:** ready-made pages for switching (with red program tally), recording
(REC toggle + live timecode), markers, track mutes and the soundboard. Source,
track, marker and sound buttons automatically pick up the names you set in
PodcastPilot.

## Stream Deck + dials (volume control)

Create a button on a dial position and bind:

- **Rotate right** → `Track volume: adjust (dB)` with change `+1`
- **Rotate left** → `Track volume: adjust (dB)` with change `-1`
- **Press** → `Track mute` (toggle)

Use `$(podcastpilot:track_1_name)` and `$(podcastpilot:track_1_gain)` in the
button text to show the track name and current gain.

## Soundboard

Needs a PodcastPilot version with the soundboard and a soundboard track in the
session. Against older versions everything else keeps working: the sound
variables stay empty and soundboard actions are rejected by the app (check the
Companion log).

- Buttons bind to the sound itself, not its position in the list: reorder or
  rename sounds in PodcastPilot and your buttons keep firing the right one.
- The ready-made presets use `Sound: toggle`: press plays the sound (taking
  over from whatever else is playing), press again fades it out. The button
  lights up green while the sound plays.
- Use `$(podcastpilot:sound_playing_name)` and
  `$(podcastpilot:sound_playing_remaining)` on a display button to show what
  is playing and how long is left (MM:SS, empty when nothing plays).

## Notes

- The connection status turns red if PodcastPilot is not running or the
  control API is disabled. The module reconnects automatically.
- Marker and sync slate actions only work while recording (the app rejects
  them otherwise — check the Companion log).
