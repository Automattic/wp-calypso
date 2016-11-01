/**
 * Pageable provides methods and state for paging support for WPCOM REST
 * API based collections.
 *
 * @property {boolean} fetchingNextPage - indicates whether a request is in progress
 * @property {array} errors - stores any errors encountered from the requests
 * @property {number} page - the current page we're on
 * @property {lastPage} lastPage - indicates whether we're on the last page
 *
 * @mixin
 */
function Pageable( prototype ) {
	prototype.fetchingNextPage = false;
	prototype.errors = [];
	prototype.page = 0;
	prototype.lastPage = false;

	/**
	 * Fetch the data from the REST API
	 *
	 * @abstract
	 * @param {object} options - options to pass
	 * @param {function} callback - should be handleResponse
	 */
	prototype.fetch = function( options, callback ) { // eslint-disable-line no-unused-vars
		throw new Error( 'You must implement this in your collection.' );
	};

	/**
	 * Parse the data from the API response
	 *
	 * @abstract
	 * @param {object/array} data - raw response returned from the API
	 * @param {string/number} siteID (optional)
	 * @returns {array} objects to add to the data array
	 */
	prototype.parse = function( data, siteID ) { // eslint-disable-line no-unused-vars
		throw new Error( 'You must implement this in your collection.' );
	};

	/**
	 * Fetch the next page of the collection.
	 *
	 * Increments the page number, and calls the collection's fetch method.
	 */
	prototype.fetchNextPage = function() {
		var options = {};

		if ( this.fetchingNextPage || this.lastPage ) {
			return;
		}

		options.number = this.perPage;
		options.page = this.page = this.page + 1;

		if ( this.search ) {
			options.search = this.search;
		}

		this.fetchingNextPage = true;

		this.fetch( options, this.fetchCallback.bind( this ) );
	};

	/**
	 * The callback that is passed to the collection's fetch method.
	 * @param {string} error - to be supplied when there was an error in handleResponse.
	 */
	prototype.fetchCallback = function( error ) {
		this.fetchingNextPage = false;
		if ( error ) {
			this.page--;
		}
	};

	/**
	 * Called by the collection's fetch method. Handles the response and
	 * decides whether to decrement the page, and whether we're on the last
	 * page or not.
	 *
	 * Implement collection.objectFactory if you need to create special objects
	 * from the data.
	 *
	 * @emits change
	 *
	 * @param {object} options - Options that were passed from fetch
	 * @param {function} callback - the fetch callback
	 * @param {object} error - any error encountered
	 * @param {object} data - the data from the response
	 */
	prototype.handleResponse = function( options, callback, error, data ) {
		var objects;

		this.found = data && data.found && parseInt( data.found, 10 );

		if ( error ) {
			this.errors.push( error );
			if ( callback ) {
				callback( error, data );
			}
			this.emit( 'change' );
			return;
		}

		objects = this.objectFactory( this.parse( data, this.siteID ) );

		if ( options.page > 1 && ! objects.length ) {
			// we requested a new page of objects and nothing came back
			this.page--;
		} else if ( objects.length ) {
			this.data = this.data.concat( objects );
		} else {
			// no new objects, move our page marker back a page
			this.page--;
		}

		if ( this.isLastPage( objects ) ) {
			this.lastPage = true;
		}

		if ( callback ) {
			callback( error, objects );
		}

		this.emit( 'change' );
	};

	/*
	 * Detects whether we're on the last page of the collection
	 *
	 * Override if you need custom logic.
	 *
	 * @param {array} - an array of objects
	 * @returns {boolean} - whether we're on the last page
	 */
	prototype.isLastPage = function( objects ) { // eslint-disable-line no-unused-vars
		return this.found === this.data.length;
	};

	/*
	 * Allows for the creation of custom objects, if overridden.
	 *
	 * @param {array} objects - a list of objects
	 * @returns {array} a list of objects
	 */
	prototype.objectFactory = function( objects ) {
		return objects;
	};

	/*
	 * Set a search term
	 *
	 * @param {string} term - search term
	 */
	prototype.setSearch = function( term ) {
		this.reset();
		this.search = term || null;
	};

	/*
	 * Reset our instance variables, so we have a blank collection
	 * to work with.
	 *
	 * @param {string} term - search term
	 */
	prototype.reset = function() {
		this.data = [];
		this.errors = [];
		this.search = null;
		this.page = 0;
		this.fetchingNextPage = false;
		this.lastPage = false;
	};


}

module.exports = Pageable;
