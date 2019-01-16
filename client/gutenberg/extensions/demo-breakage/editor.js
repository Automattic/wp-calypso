import paypalImage2x from '../simple-payments/paypal-button@2x.png';

window.onload = function() {
	const img = document.createElement( 'img' );
	img.src = paypalImage2x;
	// img.setAttribute( 'sizes', `${ paypalImage2x } 100px` );
	img.setAttribute( 'srcset', `${ paypalImage2x } 100px` );
	document.body.appendChild( img );
	console.log( 'Appended src `$o` in img: %o', paypalImage2x, img );
};
