/**
 * External dependencies
 */
var assign = require( 'lodash/assign' ),
	omit = require( 'lodash/omit' ),
	sortBy = require( 'lodash/sortBy' ),
	EventEmitter = require( 'events/' ).EventEmitter,
	includes = require( 'lodash/includes' ),
	isEqual = require( 'lodash/isEqual' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	TermStore = require( './store' ),
	treeConvert = require( 'lib/tree-convert' )( 'ID' ),
	Traverser = require( 'lib/tree-convert/tree-traverser' ),
	ActionTypes = require( './constants' ).action;

/**
* Module Variables
*/
var _categoryStoreIds = [];

module.exports = function( id ) {
	let _categoryIds = {},
		_queryStatus = {};

	if ( ! id ) {
		throw new Error( 'must supply a category-store id' );
	}

	if ( -1 !== _categoryStoreIds.indexOf( id ) ) {
		throw new Error( 'must supply a unique cateogry-store id' );
	}

	function ensureQueryStatus( siteId ) {
		if ( ! ( siteId in _queryStatus ) ) {
			_queryStatus[ siteId ] = {
				page: 1,
				found: 0,
				query: {}
			};
		}
	}

	function updateActiveQuery( siteId, query ) {
		var currentQuery;

		ensureQueryStatus( siteId );
		currentQuery = omit( _queryStatus[ siteId ].query, 'page' );
		query = omit( query, 'page' );

		if ( ! isEqual( currentQuery, query ) ) {
			delete _categoryIds[ siteId ];
			_queryStatus[ siteId ].page = 1;
		}

		_queryStatus[ siteId ].query = query;
	}

	function updateQueryStatus( siteId, values ) {
		ensureQueryStatus( siteId );
		assign( _queryStatus[ siteId ], values );
	}

	function updateNextPage( siteId, data ) {
		var nextPage;

		if ( ! data.found ) {
			return;
		}

		ensureQueryStatus( siteId );

		if ( data.found !== _categoryIds[ siteId ].length && data.terms.length ) {
			nextPage = _queryStatus[ siteId ].page + 1;
		}

		assign( _queryStatus[ siteId ], {
			page: nextPage,
			found: data.found
		} );
	}

	function ensureCategoryIds( siteId ) {
		if ( ! ( siteId in _categoryIds ) ) {
			_categoryIds[ siteId ] = [];
		}
	}

	function addSingle( siteId, category, isNewCategory ) {
		var existingIndex,
			action = isNewCategory ? 'unshift' : 'push',
			temporaryId = category.temporaryId;

		if ( temporaryId ) {
			existingIndex = _categoryIds[ siteId ].indexOf( temporaryId );
			if ( -1 !== existingIndex ) {
				_categoryIds[ siteId ].splice( existingIndex, 1, category.ID );
			}
		} else if ( -1 === _categoryIds[ siteId ].indexOf( category.ID ) ) {
			_categoryIds[ siteId ][ action ]( category.ID );
		}
	}

	function receiveCategories( siteId, categories, isNewCategory ) {
		ensureCategoryIds( siteId );

		categories.forEach( function( category ) {
			addSingle( siteId, category, isNewCategory );
		} );
	}

	function sortItems( items ) {
		var root = {};

		root.items = items;

		return Traverser.traverse( root, [ function( node ) {
			if ( node && node.items ) {
				return sortBy( node.items, function( child ) {
					return child.name.toLowerCase();
				} );
			}
			return node;
		} ] );
	}

	function incrementFound( siteId ) {
		ensureQueryStatus( siteId );
		_queryStatus[ siteId ].found += 1;
	}

	return new class extends EventEmitter {
		constructor() {
			super();
			this.id = id;
			this.dispatchToken = Dispatcher.register( this.handlePayload.bind( this ) );
		}

		hasNextPage( siteId ) {
			return ! ( siteId in _queryStatus ) || !! _queryStatus[ siteId ].page;
		}

		isFetchingPage( siteId ) {
			return ( siteId in _queryStatus ) && _queryStatus[ siteId ].isFetchingPage;
		}

		found( siteId ) {
			if ( siteId in _queryStatus ) {
				return _queryStatus[ siteId ].found;
			}

			return null;
		}

		get( siteId, categoryId ) {
			return TermStore.get( siteId, categoryId );
		}

		getChildren( siteId, categoryId = 0 ) {
			var ids = _categoryIds[ siteId ],
				categories = [];

			if ( ids ) {
				ids.forEach( function( termId ) {
					var term = TermStore.get( siteId, termId );

					if ( term && term.parent === categoryId ) {
						categories.push( term );
					}
				} );
			}
			return categories;
		}

		getAllNames( siteId ) {
			var ids = _categoryIds[ siteId ],
				categoryNames = [];

			if ( ids ) {
				ids.forEach( function( categoryId ) {
					var term = TermStore.get( siteId, categoryId );

					if ( term && term.name ) {
						categoryNames.push( term.name );
					}
				} );
			}

			return categoryNames;
		}

		all( siteId ) {
			var ids = _categoryIds[ siteId ],
				categories;

			if ( ids ) {
				categories = ids.map( function( categoryId ) {
					return TermStore.get( siteId, categoryId );
				} );

				categories = treeConvert.treeify( categories );

				categories = sortItems( categories );
			}

			return categories;
		}

		getQueryParams( siteId ) {
			ensureQueryStatus( siteId );
			return assign(
				{ number: 300 },
				_queryStatus[ siteId ].query,
				{ page: _queryStatus[ siteId ].page }
			);
		}

		handlePayload( payload ) {
			var action = payload.action,
				allStoreActions = [ ActionTypes.RECEIVE_ADD_TERM, ActionTypes.CREATE_TERM ];

			// if this instance of the category id doesn't match return but allow CREATE_TERM, RECEIVE_ADD_TERM to fire regardless
			if ( action.id !== this.id && ! includes( allStoreActions, action.type ) ) {
				return;
			}

			Dispatcher.waitFor( [ TermStore.dispatchToken ] );

			switch ( action.type ) {
				case ActionTypes.SET_CATEGORY_QUERY:
					if ( action.siteId && action.query ) {
						updateActiveQuery( action.siteId, action.query );
					}
					break;

				case ActionTypes.FETCH_CATEGORIES:
					if ( ! action.siteId ) {
						break;
					}

					updateQueryStatus( action.siteId, { isFetchingPage: true } );
					this.emit( 'change' );
					break;

				case ActionTypes.RECEIVE_ADD_TERM:
				case ActionTypes.CREATE_TERM:
				case ActionTypes.RECEIVE_TERMS:
					if ( ! action.siteId ) {
						break;
					}

					if ( action.id === this.id ) {
						updateQueryStatus( action.siteId, { isFetchingPage: false } );
					}

					if ( action.error || ! action.data ) {
						break;
					}

					if ( action.data.termType !== 'categories' ) {
						break;
					}

					receiveCategories( action.siteId, action.data.terms, ActionTypes.CREATE_TERM === action.type );
					updateNextPage( action.siteId, action.data );

					if ( action.type === ActionTypes.RECEIVE_ADD_TERM ) {
						incrementFound( action.siteId );
					}
					this.emit( 'change' );
					break;
				default:
			}
		}
	}();
};
