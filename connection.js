const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate a secret key
var secret = speakeasy.generateSecret({name: "UG003"});

console.log(secret.ascii);

// Generate a QR code
QRCode.toDataURL(secret.otpauth_url, function(err, data) {
  console.log(data) 
})