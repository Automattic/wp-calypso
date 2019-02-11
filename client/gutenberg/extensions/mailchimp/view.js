/**
 * Internal dependencies
 */
import emailValidator from 'email-validator';

/**
 * Internal dependencies
 */
import './view.scss';

const blockClassName = 'wp-block-jetpack-mailchimp';

function fetchSubscription( blogId, email ) {
	const url =
		'https://public-api.wordpress.com/rest/v1.1/sites/' +
		encodeURIComponent( blogId ) +
		'/email_follow/subscribe?email=' +
		encodeURIComponent( email );
	return new Promise( function( resolve, reject ) {
		const xhr = new XMLHttpRequest();
		xhr.open( 'GET', url );
		xhr.onload = function() {
			if ( xhr.status === 200 ) {
				const res = JSON.parse( xhr.responseText );
				resolve( res );
			} else {
				const res = JSON.parse( xhr.responseText );
				reject( res );
			}
		};
		xhr.send();
	} );
}

function activateSubscription( block, blogId ) {
	const form = block.querySelector( 'form' );
	const errorClass = 'error';
	const processingEl = block.querySelector( '.' + blockClassName + '_processing' );
	const errorEl = block.querySelector( '.' + blockClassName + '_error' );
	const successEl = block.querySelector( '.' + blockClassName + '_success' );
	form.addEventListener( 'submit', e => {
		e.preventDefault();
		const emailField = form.querySelector( 'input' );
		emailField.classList.remove( errorClass );
		const email = emailField.value;
		if ( ! emailValidator.validate( email ) ) {
			emailField.classList.add( errorClass );
			return;
		}
		block.classList.add( 'is-processing' );
		processingEl.classList.add( 'is-visible' );
		fetchSubscription( blogId, email ).then(
			response => {
				processingEl.classList.remove( 'is-visible' );
				if ( response.error && response.error !== 'member_exists' ) {
					errorEl.classList.add( 'is-visible' );
				} else {
					successEl.classList.add( 'is-visible' );
				}
			},
			() => {
				processingEl.classList.remove( 'is-visible' );
				errorEl.classList.add( 'is-visible' );
			}
		);
	} );
}

const initializeMailchimpBlocks = () => {
	const mailchimpBlocks = Array.from( document.querySelectorAll( '.' + blockClassName ) );
	mailchimpBlocks.forEach( block => {
		const blog_id = block.getAttribute( 'data-blog-id' );
		try {
			activateSubscription( block, blog_id );
		} catch ( err ) {
			if ( 'production' !== process.env.NODE_ENV ) {
				// eslint-disable-next-line no-console
				console.error( err );
			}
		}
	} );
};

if ( typeof window !== 'undefined' && typeof document !== 'undefined' ) {
	// `DOMContentLoaded` may fire before the script has a chance to run
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initializeMailchimpBlocks );
	} else {
		initializeMailchimpBlocks();
	}
}
