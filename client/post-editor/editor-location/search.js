/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { geocode } from 'lib/geocoding';
import * as stats from 'lib/posts/stats';
import SearchCard from 'components/search-card';
import EditorLocationSearchResult from './search-result';

export default React.createClass( {
	displayName: 'EditorLocationSearch',

	propTypes: {
		onError: PropTypes.func,
		onSelect: PropTypes.func
	},

	getDefaultProps() {
		return {
			onError: () => {},
			onSelect: () => {}
		};
	},

	getInitialState() {
		return {
			results: [],
			isSearching: false
		};
	},

	componentDidMount() {
		this.mounted = true;
		this.hasTrackedStats = false;
	},

	componentWillUnmount() {
		this.mounted = false;
	},

	geocode( address ) {
		const { onError } = this.props;

		if ( ! this.hasTrackedStats ) {
			stats.recordStat( 'location_search' );
			stats.recordEvent( 'Location Searched' );
			this.hasTrackedStats = true;
		}

		if ( ! address ) {
			this.setState( {
				results: []
			} );

			return;
		}

		geocode( address ).then( ( results ) => {
			if ( ! this.mounted ) {
				return;
			}

			this.setState( { results } );
		} ).catch( onError ).then( () => {
			if ( ! this.mounted ) {
				return;
			}

			this.setState( {
				isSearching: false
			} );
		} );

		this.setState( {
			isSearching: true
		} );
	},

	onSelect( result ) {
		this.refs.search.clear();
		this.props.onSelect( result );
	},

	render() {
		const { results, isSearching } = this.state;

		return (
			<div className="editor-location__search">
				<SearchCard
					ref="search"
					onSearch={ this.geocode }
					searching={ isSearching }
					delaySearch
					compact
				/>
				<ul className="editor-location__search-results">
					{ results.map( ( result ) => {
						return (
							<li key={ result.formatted_address }>
								<EditorLocationSearchResult
									result={ result }
									onClick={ this.onSelect.bind( null, result ) } />
							</li>
						);
					} ) }
				</ul>
			</div>
		);
	}
} );
