/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { geocode } from 'lib/geocoding';
import * as stats from 'lib/posts/stats';
import SearchCard from 'components/search-card';
import EditorLocationSearchResult from './search-result';

export default class extends React.Component {
	static displayName = 'EditorLocationSearch';

	static propTypes = {
		onError: PropTypes.func,
		onSelect: PropTypes.func,
		value: PropTypes.string,
	};

	static defaultProps = {
		onError: () => {},
		onSelect: () => {},
	};

	state = {
		results: [],
		isSearching: false,
	};

	componentDidMount() {
		this.mounted = true;
		this.hasTrackedStats = false;
	}

	componentWillUnmount() {
		this.mounted = false;
	}

	geocode = address => {
		const { onError } = this.props;

		if ( ! this.hasTrackedStats ) {
			stats.recordStat( 'location_search' );
			stats.recordEvent( 'Location Searched' );
			this.hasTrackedStats = true;
		}

		// If the address query matches value in props, we want to just display, not search, so we return
		// no results in that case.
		if ( ! address || address === this.props.value ) {
			this.setState( {
				results: [],
			} );

			return;
		}

		geocode( address )
			.then( results => {
				if ( ! this.mounted ) {
					return;
				}

				this.setState( { results } );
			} )
			.catch( onError )
			.then( () => {
				if ( ! this.mounted ) {
					return;
				}

				this.setState( {
					isSearching: false,
				} );
			} );

		this.setState( {
			isSearching: true,
		} );
	};

	render() {
		const { results, isSearching } = this.state;

		return (
			<div className="editor-location__search">
				<SearchCard
					onSearch={ this.geocode }
					searching={ isSearching }
					delaySearch
					compact
					value={ this.props.value }
					initialValue={ this.props.value }
				/>
				<ul className="editor-location__search-results">
					{ results.map( result => {
						return (
							<li key={ result.formatted_address }>
								<EditorLocationSearchResult
									result={ result }
									onClick={ this.props.onSelect.bind( null, result ) }
								/>
							</li>
						);
					} ) }
				</ul>
			</div>
		);
	}
}
