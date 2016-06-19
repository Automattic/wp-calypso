/**
 * External dependencies.
 */
var debug = require( 'debug' )( 'calypso:wpcom-undocumented:site' );

/**
 * Internal dependencies.
 */
var Export = require( './export' ),
	i18n = require( 'lib/i18n-utils' );

/**
 * Resources array
 * A list of endpoints with the same structure
 * [  wpcom-undocumented.functionName, siteAPiSubPath, apiVersion ]
 */
var resources = [
	[ 'statsEvents', 'posts/' ],
	[ 'statsInsights', 'stats/insights', '1.1' ],
	[ 'sshCredentialsNew', 'ssh-credentials/new', '1.1', 'post' ],
	[ 'sshCredentialsMine', 'ssh-credentials/mine', '1.1' ],
	[ 'sshCredentialsMineDelete', 'ssh-credentials/mine/delete', '1.1', 'post' ],
	[ 'sshScanToggle', 'ssh-credentials/mine', '1.1', 'post' ],
	[ 'getOption', 'option/' ]
];

var list = function( resourceOptions ) {
	return function( query, fn ) {
		var path,
			subpath = resourceOptions.subpath;

		// Handle replacement of '/:var' in the subpath with value from query
		subpath = subpath.replace( /\/:([^\/]+)/g, function( match, property ) {
			var replacement;
			if ( 'undefined' !== typeof query[ property ] ) {
				replacement = query[ property ];
				delete query[ property ];
				return '/' + replacement;
			}
			return '/';
		} );

		query.apiVersion = resourceOptions.apiVersion;

		path = '/sites/' + this._id + '/' + subpath;

		debug( 'calling undocumented site api path', path );
		debug( 'query', query );
		debug( 'resourceOptions', resourceOptions );

		if ( 'post' === resourceOptions.method ) {
			this.wpcom.req.post( path, {}, query, fn );
		} else {
			this.wpcom.req[ resourceOptions.method ]( path, query, fn );
		}
	};
};

// Walk for each resource and create related method
resources.forEach( function( resource ) {
	var name = resource[ 0 ],
		resourceOptions = {
			subpath: resource[ 1 ],
			apiVersion: resource[ 2 ] || '1',
			method: resource[ 3 ] || 'get'
		};

	UndocumentedSite.prototype[ name ] = list.call( this, resourceOptions );
} );

/**
 * Create an UndocumentedSite instance
 *
 * @param {[int]}   id          Site ID
 * @param {[WPCOM]} wpcom       WPCOM instance
 *
 * @return {{UndocumentedSite}} UndocumentedSite instance
 *
 * @api public
 */
function UndocumentedSite( id, wpcom ) {
	debug( 'UndocumentedSite', id );
	if ( ! ( this instanceof UndocumentedSite ) ) {
		return new UndocumentedSite( id, wpcom );
	}
	this.wpcom = wpcom;
	this._id = id;
}

UndocumentedSite.prototype.domains = function( callback ) {
	this.wpcom.req.get( '/sites/' + this._id + '/domains', function( error, response ) {
		if ( error ) {
			callback( error );
			return;
		}

		callback( null, response );
	} );
};

UndocumentedSite.prototype.postFormatsList = function( callback ) {
	this.wpcom.withLocale().req.get( '/sites/' + this._id + '/post-formats', {}, callback );
};

UndocumentedSite.prototype.postAutosave = function( postId, attributes, callback ) {
	this.wpcom.req.post( {
		path: '/sites/' + this._id + '/posts/' + postId + '/autosave',
		body: attributes
	}, callback );
};

UndocumentedSite.prototype.embeds = function( attributes, callback ) {
	var url = '/sites/' + this._id + '/embeds';
	if ( attributes && attributes.embed_url ) {
		url += '/render';
	}

	this.wpcom.req.get( url, attributes, callback );
};

UndocumentedSite.prototype.shortcodes = function( attributes, callback ) {
	this.wpcom.req.get( '/sites/' + this._id + '/shortcodes/render', attributes, callback );
};

UndocumentedSite.prototype.getRoles = function( callback ) {
	this.wpcom.withLocale().req.get( '/sites/' + this._id + '/roles', {}, callback );
};

UndocumentedSite.prototype.getViewers = function( query, callback ) {
	this.wpcom.req.get( '/sites/' + this._id + '/viewers', query, callback );
};

UndocumentedSite.prototype.removeViewer = function( viewerId, callback ) {
	this.wpcom.req.post( {
		path: '/sites/' + this._id + '/viewers/' + viewerId + '/delete'
	}, callback );
};

UndocumentedSite.prototype.deleteUser = function( userId, attributes, callback ) {
	this.wpcom.req.post( {
		path: '/sites/' + this._id + '/users/' + userId + '/delete',
		body: attributes
	}, callback );
};

UndocumentedSite.prototype.updateUser = function( userId, attributes, callback ) {
	this.wpcom.req.post( {
		path: '/sites/' + this._id + '/users/' + userId,
		body: attributes
	}, callback );
};

UndocumentedSite.prototype.getUser = function( login, callback ) {
	this.wpcom.req.get( '/sites/' + this._id + '/users/login:' + login, callback );
};

UndocumentedSite.prototype.removeFollower = function( followerId, callback ) {
	return this.wpcom.req.post( {
		path: '/sites/' + this._id + '/followers/' + followerId + '/delete'
	}, callback );
};

UndocumentedSite.prototype.removeEmailFollower = function( followerId, callback ) {
	this.wpcom.req.post( {
		path: '/sites/' + this._id + '/email-followers/' + followerId + '/delete'
	}, callback );
};

UndocumentedSite.prototype.setOption = function( query, callback ) {
	this.wpcom.req.post(
		'/sites/' + this._id + '/option',
		{
			option_name: query.option_name,
			is_array: query.is_array,
			site_option: query.site_option
		},
		{ option_value: query.option_value },
		callback
	);
};

UndocumentedSite.prototype.postCounts = function( options, callback ) {
	let query = Object.assign( {
		type: 'post',
		apiNamespace: 'wpcom/v2'
	}, options );

	const type = query.type;
	delete query.type;

	return this.wpcom.req.get( '/sites/' + this._id + '/post-counts/' + type, query, callback );
};

/**
 * Create an `Export` instance
 *
 * @param  {[String]} id Export instance ID
 * @return {[Export]}    new Export instance
 */
UndocumentedSite.prototype.export = function( id ) {
	return new Export( id, this._id, this.wpcom );
};

/**
 * Add a new export
 *
 * @param {Function} fn Callback on completion of new export POST request
 * @return {Export}     new Export instance
 */
UndocumentedSite.prototype.newExport = function( fn ) {
	var exportObject = new Export( null, this._id, this.wpcom );
	return exportObject.new( fn );
};

/**
 * Returns media storage limits and space used for a given site. If site has
 * unlimited storage or is a jetpack site, values returned will be -1.
 *
 * @param {Function} callback - called on completion of the GET request
 * @return {Object} promise - resolves on completion of the GET request
 */
UndocumentedSite.prototype.mediaStorage = function( callback ) {
	return this.wpcom.req.get( '/sites/' + this._id + '/media-storage', callback );
};

/**
 * Expose `UndocumentedSite` module
 */
module.exports = UndocumentedSite;
