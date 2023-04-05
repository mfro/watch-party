yarn build
scp main.js api.mfro.me:server/watch-party/main.js
ssh api.mfro.me startup/watch-party.sh
