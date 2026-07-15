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
volume (dB), mute/solo, monitor volume, default transition.

**Feedbacks:** source on program (tally), recording active, track muted/soloed,
source signal lost.

**Variables:** timecode, elapsed, dropped frames, session name, program source,
source/track names and gains — plus per-track levels (dBFS) if you enable
"Track levels as variables".

**Presets:** ready-made pages for switching (with red program tally), recording
(REC toggle + live timecode), markers and track mutes. Source, track and marker
buttons automatically pick up the names you set in PodcastPilot.

## Stream Deck + dials (volume control)

Create a button on a dial position and bind:

- **Rotate right** → `Track volume: adjust (dB)` with change `+1`
- **Rotate left** → `Track volume: adjust (dB)` with change `-1`
- **Press** → `Track mute` (toggle)

Use `$(podcastpilot:track_1_name)` and `$(podcastpilot:track_1_gain)` in the
button text to show the track name and current gain.

## Notes

- The connection status turns red if PodcastPilot is not running or the
  control API is disabled. The module reconnects automatically.
- Marker and sync slate actions only work while recording (the app rejects
  them otherwise — check the Companion log).
