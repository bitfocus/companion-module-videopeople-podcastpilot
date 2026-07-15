# companion-module-videopeople-podcastpilot

[Bitfocus Companion](https://bitfocus.io/companion) connection module for
[PodcastPilot](https://podcastpilot.app), the multicam podcast recording app
for Mac (SDI via Blackmagic DeckLink, NDI® and USB sources, fully synced
timelines for Premiere Pro, DaVinci Resolve and Final Cut Pro).

Talks to PodcastPilot's local WebSocket control API (PodcastPilot 0.9.50+,
Settings → Remote). See [companion/HELP.md](companion/HELP.md) for setup and
usage, including Stream Deck + dial recipes for volume control.

## Features

- **Actions:** cut/fade to source, record start/stop/toggle, predefined
  markers, frame-accurate sync slate, track volume (absolute dB + rotary
  delta), mute/solo, monitor volume, default transition
- **Feedbacks:** program tally, recording active, track muted/soloed,
  source signal lost
- **Variables:** timecode, elapsed, dropped frames, session name, program
  source, source/track names and gains, optional per-track levels (dBFS)
- **Presets:** ready-made pages for switching, recording, markers and audio,
  automatically labeled with the source/track/marker names from the app

## Development

```bash
corepack yarn install
corepack yarn dev       # tsc watch
corepack yarn package   # build store package (tgz)
```

Point Companion's developer modules path at a folder containing this repo
(no symlinks — Companion sandboxes modules with Node's permission model).

Protocol documentation for the control API is available on request:
kontakt@videopeople.dk. Protocol changes stay backwards compatible within
protocol v1.

## License

MIT © Video People ApS
