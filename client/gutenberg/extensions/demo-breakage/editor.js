import paypalImage2x from '../simple-payments/paypal-button@2x.png';

window.onload = function() {
	const img = document.createElement( 'img' );
	img.src = paypalImage2x;
	document.body.appendChild( img );
	console.log( 'Appended src `$o` in img: %o', paypalImage2x, img );
};
