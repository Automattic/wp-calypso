/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find, get, noop, startsWith, trim, uniq } from 'lodash';
import { localize } from 'i18n-calypso';
import { v4 as uuid } from 'uuid';

/**
 * Internal dependencies
 */
import SuggestionSearch from 'components/suggestion-search';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';
import { convertToCamelCase } from 'state/data-layer/utils';
import PopularTopics from 'components/site-verticals-suggestion-search/popular-topics';

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
		requestDefaultVertical: PropTypes.func,
		requestVerticals: PropTypes.func,
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
		requestDefaultVertical: noop,
		requestVerticals: noop,
		shouldShowPopularTopics: noop,
		searchResultsLimit: 5,
		verticals: [],
		defaultVertical: {},
	};

	constructor( props ) {
		super( props );
		this.state = {
			searchValue: props.initialValue,
			railcar: this.getNewRailcar(),
		};
		props.requestDefaultVertical();
	}

	componentDidMount() {
		// If we have a stored vertical, grab the preview
		this.props.initialValue && this.props.requestVerticals( this.props.initialValue, 1 );
	}

	componentDidUpdate( prevProps ) {
		// Check if there's a direct match for any subsequent
		// HTTP requests
		if ( prevProps.lastUpdated !== this.props.lastUpdated ) {
			this.updateVerticalData(
				this.searchForVerticalMatches( this.state.searchValue ),
				this.state.searchValue
			);
		}
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

	onSiteTopicChange = value => {
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
			this.props.requestVerticals( value, this.props.searchResultsLimit );
			this.setState( { railcar: this.getNewRailcar() } );
		}

		this.setState( { searchValue: value } );
		this.updateVerticalData( result, value );
	};

	onPopularTopicSelect = value => {
		this.props.requestVerticals( value, 1 );
		this.setState( { searchValue: value } );
	};

	getSuggestions = () => this.props.verticals.map( vertical => vertical.verticalName );

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
		const { translate, placeholder, autoFocus, shouldShowPopularTopics } = this.props;
		const showPopularTopics = shouldShowPopularTopics( this.state.searchValue );
		return (
			<>
				<SuggestionSearch
					id="siteTopic"
					placeholder={ placeholder || translate( 'e.g. Fashion, travel, design, plumbing' ) }
					onChange={ this.onSiteTopicChange }
					suggestions={ this.getSuggestions() }
					value={ this.state.searchValue }
					sortResults={ this.sortSearchResults }
					autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
					railcar={ this.state.railcar }
				/>
				{ showPopularTopics && <PopularTopics onSelect={ this.onPopularTopicSelect } /> }
			</>
		);
	}
}

const SITE_VERTICALS_REQUEST_ID = 'site-verticals-search-results';
const DEFAULT_SITE_VERTICAL_REQUEST_ID = 'default-site-verticals-search-results';

const requestSiteVerticalHttpData = ( searchTerm, limit = 7, id = SITE_VERTICALS_REQUEST_ID ) => {
	searchTerm = trim( searchTerm );
	requestHttpData(
		id,
		http( {
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: '/verticals',
			query: {
				search: searchTerm,
				limit,
				include_preview: true,
			},
		} ),
		{
			fromApi: () => data => [ [ id, convertToCamelCase( data ) ] ],
			freshness: -Infinity,
		}
	);
};

export const isVerticalSearchPending = () =>
	'pending' === get( getHttpData( SITE_VERTICALS_REQUEST_ID ), 'state', false );

export default localize(
	connect(
		() => {
			const siteVerticalHttpData = getHttpData( SITE_VERTICALS_REQUEST_ID );
			const defaultVerticalHttpData = getHttpData( DEFAULT_SITE_VERTICAL_REQUEST_ID );
			return {
				lastUpdated: get( siteVerticalHttpData, 'lastUpdated', 0 ),
				verticals: get( siteVerticalHttpData, 'data', [] ),
				defaultVertical: get( defaultVerticalHttpData, 'data[0]', {} ),
			};
		},
		( dispatch, ownProps ) => ( {
			shouldShowPopularTopics: searchValue => ! searchValue && ownProps.showPopular,
			requestVerticals: requestSiteVerticalHttpData,
			requestDefaultVertical: ( searchTerm = 'business' ) => {
				if ( ! get( getHttpData( DEFAULT_SITE_VERTICAL_REQUEST_ID ), 'data', null ) ) {
					requestSiteVerticalHttpData( searchTerm, 1, DEFAULT_SITE_VERTICAL_REQUEST_ID );
				}
			},
		} )
	)( SiteVerticalsSuggestionSearch )
);
