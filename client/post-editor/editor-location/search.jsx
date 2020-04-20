/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { geocode } from 'lib/geocoding';
import { recordEditorStat, recordEditorEvent } from 'state/posts/stats';
import SearchCard from 'components/search-card';
import EditorLocationSearchResult from './search-result';

class EditorLocationSearch extends React.Component {
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

	geocode = ( address ) => {
		const { onError } = this.props;

		if ( ! this.hasTrackedStats ) {
			this.props.recordEditorStat( 'location_search' );
			this.props.recordEditorEvent( 'Location Searched' );
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
			.then( ( results ) => {
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

		// Cast undefined "value" to empty string because Search treats the two
		// differently in componentWillReceiveProps().
		const value = this.props.value || '';

		return (
			<div className="editor-location__search">
				<SearchCard
					onSearch={ this.geocode }
					searching={ isSearching }
					delaySearch
					compact
					value={ value }
					initialValue={ value }
				/>
				<ul className="editor-location__search-results">
					{ results.map( ( result ) => {
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

export default connect( null, { recordEditorStat, recordEditorEvent } )( EditorLocationSearch );
