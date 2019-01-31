/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { debounce, find, get, noop, startsWith, trim, uniq, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SuggestionSearch from 'components/suggestion-search';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';

export class SiteVerticalsSuggestionSearch extends Component {
	static propTypes = {
		initialValue: PropTypes.string,
		onChange: PropTypes.func,
		placeholder: PropTypes.string,
		charsToTriggerSearch: PropTypes.number,
		searchResultsLimit: PropTypes.number,
		verticals: PropTypes.array,
	};

	static defaultProps = {
		initialValue: '',
		onChange: noop,
		placeholder: '',
		charsToTriggerSearch: 1,
		verticals: [],
		searchResultsLimit: 5,
	};

	constructor( props ) {
		super( props );
		this.state = {
			searchValue: props.initialValue,
		};
	}

	componentDidMount() {
		this.props.initialValue && this.props.requestVerticals( this.props.initialValue, 1 );
	}

	componentDidUpdate( prevProps ) {
		// Check if there's a direct match for any subsequent
		// HTTP requests
		if ( prevProps.lastUpdated !== this.props.lastUpdated ) {
			this.updateVerticalData(
				this.searchInResult( this.state.searchValue ),
				this.state.searchValue
			);
		}
	}

	// When a user is keying through the results,
	// only update the vertical when they select a result.
	searchInResult = ( value = '' ) =>
		find(
			this.props.verticals,
			item => item.vertical_name.toLowerCase() === value.toLowerCase() && ! isEmpty( item.preview )
		);

	updateVerticalData = ( result, value ) => {
		// If there's not direct match
		// return a default model
		const verticalData = result || {
			vertical_name: value,
			vertical_slug: value,
			is_user_input_vertical: true,
		};

		this.props.onChange( verticalData );
	};

	onSiteTopicSelect = value => {
		this.setState( { searchValue: value } );
		this.updateVerticalData( this.searchInResult( value ), value );
	};

	onSiteTopicChange = value => {
		value = trim( value );

		// Cancel delayed invocations in case of deletion.
		if ( ! value || value.length < this.props.charsToTriggerSearch ) {
			this.props.requestVerticals.cancel();
		}

		const result = this.searchInResult( value );

		if (
			value &&
			value.length >= this.props.charsToTriggerSearch &&
			// Don't trigger a search if there's already an exact, non-user-defined match from the API
			! result
		) {
			this.props.requestVerticals( value, 1 === value.length ? 1 : this.props.searchResultsLimit );
		}

		this.setState( { searchValue: value } );
	};

	getSuggestions = () => this.props.verticals.map( vertical => vertical.vertical_name );

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
		const { translate, placeholder, autoFocus } = this.props;
		return (
			<SuggestionSearch
				id="siteTopic"
				placeholder={ placeholder || translate( 'e.g. Fashion, travel, design, plumber' ) }
				onSelect={ this.onSiteTopicSelect }
				onChange={ this.onSiteTopicChange }
				suggestions={ this.getSuggestions() }
				value={ this.state.searchValue }
				sortResults={ this.sortSearchResults }
				autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
			/>
		);
	}
}

export const SITE_VERTICALS_REQUEST_ID = 'site-verticals-search-results';
const requestSiteVerticals = debounce(
	( searchTerm, limit = 5 ) => {
		return requestHttpData(
			SITE_VERTICALS_REQUEST_ID,
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
				fromApi: () => data => [ [ SITE_VERTICALS_REQUEST_ID, data ] ],
				freshness: -Infinity,
			}
		);
	},
	333,
	{ leading: false, trailing: true }
);

export default localize(
	connect(
		() => {
			const siteVerticalHttpData = getHttpData( SITE_VERTICALS_REQUEST_ID );
			return {
				lastUpdated: get( siteVerticalHttpData, 'lastUpdated', [] ),
				verticals: get( siteVerticalHttpData, 'data', [] ),
			};
		},
		() => ( { requestVerticals: requestSiteVerticals } )
	)( SiteVerticalsSuggestionSearch )
);
