/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { loadScript } from 'lib/load-script';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import HeaderCake from 'components/header-cake';
import SearchCard from 'components/search-card';
import StepNavigation from '../step-navigation';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import Main from 'components/main';

let autocompleteService = {};

class SearchForALocation extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = { predictions: [] };

	componentWillMount() {
		loadScript(
			'//maps.googleapis.com/maps/api/js?key=AIzaSyBO5-y0uPC5DhwrcKy-NHUkLUmFQpNj-1g&libraries=places',
			function() {
				autocompleteService = new google.maps.places.AutocompleteService();
			}
		);
	}

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

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
		const nextHref = '/google-my-business/address/' + siteId;
		const backHref = '/google-my-business/show-list-of-locations/' + siteId;
		const tosHref =
			'https://www.google.com/intl/en/+/policy/pages-services.html?_ga=2.180297060.1172336099.1521039613-786824372.1502702633';
		const predictionsMarkup =
			predictions &&
			predictions.map( prediction => {
				return (
					<CompactCard key={ prediction.place_id } href={ nextHref }>
						{ prediction.structured_formatting.main_text }
						<p>{ prediction.structured_formatting.secondary_text }</p>
					</CompactCard>
				);
			} );

		return (
			<Main className="google-my-business search-for-a-location">
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card className="search-for-a-location__search-section">
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
				</Card>

				<StepNavigation value={ 10 } total={ 100 } backHref={ backHref } nextHref={ nextHref } />
			</Main>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( SearchForALocation ) );
