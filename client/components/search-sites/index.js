import { Component } from 'react';
import { connect } from 'react-redux';
import getSites from 'calypso/state/selectors/get-sites';
import { searchCollection } from './utils';

const mapState = ( state ) => ( {
	sites: getSites( state ),
} );

export default function searchSites( WrappedComponent ) {
	const componentName = WrappedComponent.displayName || WrappedComponent.name || '';

	class Searcher extends Component {
		state = { term: null };

		setSearchTerm = ( term ) => this.setState( { term: term?.toLowerCase() ?? '' } );

		getSearchResults() {
			return this.state.term
				? searchCollection( this.props.sites, this.state.term, [ 'name', 'URL' ] )
				: null;
		}

		render() {
			return (
				<WrappedComponent
					{ ...this.props }
					searchTerm={ this.state.term }
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
