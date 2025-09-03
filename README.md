# monkeyTypewriter

## Setting Up Local Connections

1. When connected to the desired network, find your IP address (for Mac, go to settings -> WiFi -> Connected Network Details -> IP Address)
2. Go to `firebase.js` and update the IP address on `connectFirestoreEmulator(arg1, IP, arg2)`
3. Open up two terminals. On the first run `firebase emulators:start`. Once that is loaded, on the second run `ntl dev --port 8888`.

## Setting up QR Code

1. Go to `https://www.qr-code-generator.com/` to create the code.
2. The link will be `"IP":8888` (ex. 10.197.95.107:8888)

## Secret Shakespeare

Pressing `Enter` will toggle the ability to print out Shakespeare's Romeo and Juliet. There are no indicators on the UI, so be careful when you press it.  
