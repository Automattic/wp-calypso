/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSites from 'state/selectors/get-sites';

const matches = ( item, term, keys ) =>
	keys.some( ( key ) => get( item, key, '' ).toLowerCase().indexOf( term ) > -1 );

const searchCollection = ( collection, term, keys ) =>
	collection.filter( ( item ) => matches( item, term, keys ) );

const mapState = ( state ) => ( {
	sites: getSites( state ),
} );

export default function searchSites( WrappedComponent ) {
	const componentName = WrappedComponent.displayName || WrappedComponent.name || '';

	class Searcher extends Component {
		state = { term: null };

		setSearchTerm = ( term ) => this.setState( { term } );

		getSearchResults() {
			return this.state.term
				? searchCollection( this.props.sites, this.state.term.toLowerCase(), [ 'name', 'URL' ] )
				: null;
		}

		render() {
			return (
				<WrappedComponent
					{ ...this.props }
					searchSites={ this.setSearchTerm }
					sitesFound={ this.getSearchResults() }
				/>
			);
		}
	}

	const Connected = connect( mapState )( Searcher );
	Connected.displayName = `SearchSites(${ componentName })`;
	return Connected;
}
