/**
 * External dependencies
 */
import React from 'react';
import assign from 'lodash/assign';

/**
 * Internal dependencies
 */
import { doSearch, getSearchOpen } from './index';

export default function( Component ) {
	const componentName = Component.displayName || Component.name || '';

	return React.createClass( {
		displayName: 'Searchable' + componentName,

		getInitialState() {
			return {
				searchOpen: false
			};
		},

		componentWillReceiveProps( nextProps ) {
			if ( ! nextProps.search ) {
				this.setState( {
					searchOpen: false
				} );
			}
		},

		render() {
			const props = assign( {}, this.props, {
				doSearch: doSearch.bind( this ),
				getSearchOpen: getSearchOpen.bind( this )
			} );
			return React.createElement( Component, props );
		}
	} );
}
