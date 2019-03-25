/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find, get, noop, startsWith, uniq } from 'lodash';
import { localize } from 'i18n-calypso';
import { v4 as uuid } from 'uuid';

/**
 * Internal dependencies
 */
import SuggestionSearch from 'components/suggestion-search';
import PopularTopics from 'components/site-verticals-suggestion-search/popular-topics';
import QueryVerticals from 'components/data/query-verticals';
import { getVerticals } from 'state/signup/verticals/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export class SiteVerticalsSuggestionSearch extends Component {
	static propTypes = {
		charsToTriggerSearch: PropTypes.number,
		initialValue: PropTypes.string,
		lastUpdated: PropTypes.number,
		onChange: PropTypes.func,
		placeholder: PropTypes.string,
		shouldShowPopularTopics: PropTypes.func,
		searchResultsLimit: PropTypes.number,
		verticals: PropTypes.array,
		defaultVertical: PropTypes.object,
	};

	static defaultProps = {
		charsToTriggerSearch: 1,
		initialValue: '',
		onChange: noop,
		placeholder: '',
		shouldShowPopularTopics: noop,
		searchResultsLimit: 5,
		verticals: [],
		defaultVertical: {},
	};

	constructor( props ) {
		super( props );
		this.state = {
			railcar: this.getNewRailcar(),
			candidateVerticals: [],
		};
	}

	getNewRailcar() {
		return {
			id: `${ uuid().replace( /-/g, '' ) }-site-vertical-suggestion`,
			fetch_algo: '/verticals',
			action: 'site_vertical_selected',
		};
	}

	// When a user is keying through the results,
	// only update the vertical when they select a result.
	searchForVerticalMatches = ( value = '' ) =>
		find(
			this.props.verticals,
			item => item.verticalName.toLowerCase() === value.toLowerCase() && !! item.preview
		);

	updateVerticalData = ( result, value ) =>
		this.props.onChange(
			result || {
				isUserInputVertical: true,
				parent: '',
				preview: get( this.props.defaultVertical, 'preview', '' ),
				verticalId: '',
				verticalName: value,
				verticalSlug: value,
			}
		);

	onSiteTopicChange = ( value, isNavigating ) => {
		const hasValue = !! value;
		const valueLength = value.length || 0;
		const valueLengthShouldTriggerSearch = valueLength >= this.props.charsToTriggerSearch;
		const result = this.searchForVerticalMatches( value );

		if (
			hasValue &&
			valueLengthShouldTriggerSearch &&
			// Don't trigger a search if there's already an exact, non-user-defined match from the API
			! result
		) {
			this.setState( { railcar: this.getNewRailcar() } );
		}

		this.props.onChange( {
			verticalName: value,
		} );

		this.setState( {
			isNavigating,
		} );
	};

	componentDidUpdate( prevProps ) {
		// The suggestion list should only be updated when a user is not navigating the list through keying.
		// Note: it's intentional to use object reference comparison here.
		// Since `verticals` props is connected from a redux state here, if the two references are identical,
		// we can safely say that the two content are identical, thanks to the immutability invariant of redux.
		if ( prevProps.verticals !== this.props.verticals && ! this.state.isNavigating ) {
			// It's safe here to call setState() because we prevent the indefinite loop by the wrapping condition.
			// See the official doc here: https://reactjs.org/docs/react-component.html#componentdidupdate
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( {
				candidateVerticals: this.props.verticals,
			} );
		}
	}

	onPopularTopicSelect = value => {
		this.setState( { searchValue: value } );
	};

	getSuggestions = () => this.state.candidateVerticals.map( vertical => vertical.verticalName );

	sortSearchResults = ( suggestionsArray, queryString ) => {
		let queryMatch;

		// first do the search, omit and cache exact matches
		queryString = queryString.trim().toLocaleLowerCase();
		const lazyResults = suggestionsArray.filter( val => {
			if ( val.toLocaleLowerCase() === queryString ) {
				queryMatch = val;
				return false;
			}
			return val.toLocaleLowerCase().includes( queryString );
		} );

		// second find the words that start with the search
		const startsWithResults = lazyResults.filter( val =>
			startsWith( val.toLocaleLowerCase(), queryString )
		);

		// merge, dedupe, bye
		return uniq(
			startsWithResults.concat( lazyResults.concat( queryMatch ? [ queryMatch ] : [] ) )
		);
	};

	render() {
		const {
			translate,
			placeholder,
			autoFocus,
			shouldShowPopularTopics,
			isVerticalSearchPending,
		} = this.props;
		const showPopularTopics = shouldShowPopularTopics( this.props.searchValue );

		return (
			<>
				<QueryVerticals searchTerm={ this.props.searchValue } />
				<QueryVerticals searchTerm={ 'business' } limit={ 1 } />
				<SuggestionSearch
					id="siteTopic"
					placeholder={ placeholder || translate( 'Enter a keyword or select one from below.' ) }
					onChange={ this.onSiteTopicChange }
					suggestions={ this.getSuggestions() }
					value={ this.props.searchValue }
					sortResults={ this.sortSearchResults }
					autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
					isSearching={ isVerticalSearchPending }
					railcar={ this.state.railcar }
				/>
				{ showPopularTopics && <PopularTopics onSelect={ this.onSiteTopicChange } /> }
			</>
		);
	}
}

export default localize(
	connect(
		( state, ownProps ) => {
			const verticals = getVerticals( state, ownProps.searchValue );
			const isVerticalSearchPending = null == verticals;

			return {
				verticals: verticals || [],
				isVerticalSearchPending,
				defaultVertical: get( getVerticals( state, 'business' ), '0', {} ),
			};
		},
		( dispatch, ownProps ) => ( {
			shouldShowPopularTopics: searchValue => ! searchValue && ownProps.showPopular,
		} )
	)( SiteVerticalsSuggestionSearch )
);
