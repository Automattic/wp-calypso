/** @format */

/**
 * External dependencies
 */

import debugFactory from 'debug';
const debug = debugFactory( 'calypso:wpcom-undocumented:mailing-list' );

/**
 * `MailingList` constructor.
 *
 * @constructor
 * @param {WPCOM} wpcom
 * @public
 */

function MailingList( category, wpcom ) {
	if ( ! ( this instanceof MailingList ) ) {
		return new MailingList( category, wpcom );
	}

	this._category = category;
	this.wpcom = wpcom;
}

/**
 * Subscribe an email address to the mailing list.
 *
 * *Example:*
 *    var settings = {}; // your settings here
 *
 *    // Get site settings information
 *    wpcom
 *    .mailingList('marketing')
 *    .subscribe(emailAddress, hmac, context, function(err, result) {
 *      // result object contains `category`, `email`, and `subscribed` properties
 *    });
 *
 * @param {String} emailAddress
 * @param {String} hmac
 * @param {Object} [context]
 * @param {Function} callback
 * @public
 */

MailingList.prototype.subscribe = function( emailAddress, hmac, context, callback ) {
	debug( '/mailing-lists/:category/subscribers/:emailAddress/new' );

	// `context` is optional
	if ( 'function' === typeof context ) {
		callback = context;
		context = undefined;
	}

	return this.wpcom.req.post(
		createSubscriberResourceUrl( this._category, emailAddress, 'new' ),
		createRequestBody( hmac, context ),
		callback
	);
};

/**
 * Unsubscribe an email address to the mailing list.
 *
 * *Example:*
 *    var settings = {}; // your settings here
 *
 *    // Get site settings information
 *    wpcom
 *    .mailingList('marketing')
 *    .unsubscribe(emailAddress, hmac, context, function(err, result) {
 *      // result object contains `category`, `email`, and `subscribed` properties
 *    });
 *
 * @param {String} emailAddress
 * @param {String} hmac
 * @param {Object} [context]
 * @param {Function} callback
 * @public
 */

MailingList.prototype.unsubscribe = function( emailAddress, hmac, context, callback ) {
	debug( '/mailing-lists/:category/subscribers/:emailAddress/delete' );

	// `context` is optional
	if ( 'function' === typeof context ) {
		callback = context;
		context = undefined;
	}

	return this.wpcom.req.post(
		createSubscriberResourceUrl( this._category, emailAddress, 'delete' ),
		createRequestBody( hmac, context ),
		callback
	);
};

function createSubscriberResourceUrl( category, emailAddress, method ) {
	var url =
		'/mailing-lists/' +
		encodeURIComponent( category ) +
		'/subscribers/' +
		encodeURIComponent( emailAddress );

	if ( method ) {
		url += '/' + method;
	}

	return url;
}

function createRequestBody( hmac, context ) {
	return {
		hmac: hmac,
		context: context,
	};
}

/*!
 * Expose `MailingList` module
 */

export default MailingList;
