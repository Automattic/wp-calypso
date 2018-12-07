/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { debounce, get, trim } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SuggestionSearch from 'components/suggestion-search';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';

export class SiteVerticalsSuggestionSearch extends Component {
	static propTypes = {
		placeholder: PropTypes.string,
		onChange: PropTypes.func,
		value: PropTypes.string,
	};

	constructor( props ) {
		super( props );
		this.state = {
			searchValue: props.value || '',
			lastSearchValue: '',
			charsToTriggerSearch: 3,
		};
	}

	onSiteTopicChange = value => {
		value = trim( value );
		if (
			value &&
			value !== this.state.lastSearchValue &&
			value.length === this.state.charsToTriggerSearch
		) {
			this.props.requestVerticals( value );
			this.setState( {
				lastSearchValue: value,
			} );
		}
		this.setState( { siteTopicValue: value } );

		/*
			TODO: do we want to do anything with the vertical data? E.g., pass it up?
			{
				"vertical_name": "Lifestyle / Inspiration",
				"vertical_id": "a8c.0.2",
				"preview": [],
				"is_valid": true
			}
			const verticalData = find( this.props.verticals, [ 'vertical_name', value ] ) || value;
		 */
		this.props.onChange( value );
	};

	getSuggestions = () => this.props.verticals.map( vertical => vertical.vertical_name );

	render() {
		const { translate, placeholder } = this.props;

		return (
			<div>
				<SuggestionSearch
					id="siteTopic"
					placeholder={
						placeholder || translate( 'e.g. Fashion, travel, design, plumber, electrician' )
					}
					onChange={ this.onSiteTopicChange }
					suggestions={ this.getSuggestions() }
					value={ this.state.searchValue }
				/>
			</div>
		);
	}
}

const SITE_VERTICALS_REQUEST_ID = 'site-verticals-search-results';
const requestSiteVerticals = ( searchTerm, limit = 5 ) => {
	return requestHttpData(
		SITE_VERTICALS_REQUEST_ID,
		http( {
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: '/verticals',
			query: {
				search: searchTerm,
				limit,
			},
		} ),
		{
			fromApi: () => data => [ [ SITE_VERTICALS_REQUEST_ID, data ] ],
			freshness: -Infinity,
		}
	);
};

export default localize(
	connect(
		() => ( {
			verticals: get( getHttpData( SITE_VERTICALS_REQUEST_ID ), 'data', [] ),
		} ),
		() => ( { requestVerticals: debounce( requestSiteVerticals, 500 ) } )
	)( SiteVerticalsSuggestionSearch )
);
