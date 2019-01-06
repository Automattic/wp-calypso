/** @format */

/**
 * Internal dependencies
 */

import './view.scss';

//

/*
 * WARNING: This file is distributed verbatim in Jetpack.
 * There should be nothing WordPress.com specific in this file.
 *
 * @hide-in-jetpack
 */
/**

/* global jQuery */
/* jshint esversion: 5, es3:false */

const blockClassName = 'wp-block-jetpack-mailchimp';

const JetpackEmailSubscribe = {
	validateEmail: function( email ) {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test( String( email ).toLowerCase() );
	},
	fetch: ( blogId, email ) => {
		const url =
			'https://public-api.wordpress.com/rest/v1.1/sites/' +
			encodeURI( blogId ) +
			'/email_follow/subscribe?email=' +
			encodeURI( email );
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
	},
	activate: function( block, blogId ) {
		const form = block.querySelector( 'form' );
		const errorClass = blockClassName + '-form-error';
		const processingEl = block.querySelector( '.' + blockClassName + '-processing' );
		const errorEl = block.querySelector( '.' + blockClassName + '-error' );
		const successEl = block.querySelector( '.' + blockClassName + '-success' );
		form.addEventListener( 'submit', e => {
			const emailField = form.querySelector( '.' + blockClassName + '-email' );
			emailField.classList.remove( errorClass );
			const email = emailField.value;
			if ( ! this.validateEmail( email ) ) {
				emailField.classList.add( errorClass );
			}
			block.classList.add( 'is-processing' );
			processingEl.classList.add( 'is-visible' );
			this.fetch( blogId, email ).then(
				response => {
					processingEl.classList.remove( 'is-visible' );
					if ( response.error ) {
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
			e.preventDefault();
		} );
	},
};

const initializeMailchimpBlocks = () => {
	const mailchimpBlocks = Array.from( document.querySelectorAll( '.' + blockClassName ) );
	mailchimpBlocks.forEach( block => {
		const blog_id = block.getAttribute( 'data-blog-id' );
		try {
			JetpackEmailSubscribe.activate( block, blog_id );
		} catch ( e ) {}
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
