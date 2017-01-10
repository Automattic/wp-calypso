scroll-to
=======
A utility module to smoothly scroll to a window position.

## Usage
```es6
import scrollTo from 'lib/scroll-to'; 

scrollTo( {
	x: 400,
	y: 500,
	duration: 500,
	onComplete: function() {
		console.log( 'done!' );
	}
} );
```