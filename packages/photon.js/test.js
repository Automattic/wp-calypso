
var photon = require('./');

var url = process.argv[2] || 'https://tootallnate.files.wordpress.com/2014/05/img_0842.jpg';
console.log(photon(url, {
  width: 100,
  height: 200
}));
