/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { loadScript } from 'lib/load-script';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import CompactCard from 'components/card/compact';
import SearchCard from 'components/search-card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';

let autocompleteService = {};

class SearchForALocation extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = { predictions: [], shouldShowBox: true };

	componentWillMount() {
		loadScript(
			'//maps.googleapis.com/maps/api/js?key=AIzaSyBO5-y0uPC5DhwrcKy-NHUkLUmFQpNj-1g&libraries=places',
			function() {
				autocompleteService = new google.maps.places.AutocompleteService();
			}
		);
	}

	updatePredictions = predictions => {
		this.setState( {
			// we should use global state
			predictions: predictions,
		} );
	};

	handleSearch = query => {
		this.setState( {
			query: query,
		} );
		if ( query ) {
			autocompleteService.getQueryPredictions( { input: query }, this.updatePredictions );
		} else {
			this.updatePredictions( [] );
		}
	};

	render() {
		const { translate, siteId } = this.props;
		const { predictions } = this.state;
		const nextHref = '/google-my-business/create/address/' + siteId;
		const tosHref =
			'https://www.google.com/intl/en/+/policy/pages-services.html?_ga=2.180297060.1172336099.1521039613-786824372.1502702633';
		const predictionsMarkup =
			predictions &&
			predictions.map( prediction => {
				return (
					<CompactCard
						key={ prediction.place_id }
						href={ nextHref }
						className="search-for-a-location__result"
					>
						<strong>{ prediction.structured_formatting.main_text }</strong>
						<br />
						{ prediction.structured_formatting.secondary_text }
					</CompactCard>
				);
			} );

		return (
			<div className="search-for-a-location">
				<CompactCard className="search-for-a-location__search-section">
					<FormFieldset>
						<FormLegend className="search-for-a-location__legend">
							{ translate( "What's the name of your business?" ) }
						</FormLegend>
						<FormLabel>{ translate( 'Business Name' ) }</FormLabel>
						<SearchCard
							onSearch={ this.handleSearch }
							className="search-for-a-location__search-card is-compact"
						/>
						{ predictionsMarkup }
					</FormFieldset>

					<p className="search-for-a-location__search-tos">
						{ translate( 'By continuing you agree to the following {{a}}Terms of Service{{/a}}', {
							components: {
								a: <a href={ tosHref } />,
							},
						} ) }
					</p>
				</CompactCard>
			</div>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( SearchForALocation ) );
