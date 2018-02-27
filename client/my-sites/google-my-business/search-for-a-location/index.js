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
import GoogleMyBusinessLocation from '../google-my-business-location';
import HeaderCake from 'components/header-cake';
import SearchCard from 'components/search-card';

let autocompleteService = {};

class SearchForALocation extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = { predictions: [] };

	componentWillMount() {
		return new Promise( resolve => {
			loadScript(
				'//maps.googleapis.com/maps/api/js?key=AIzaSyBO5-y0uPC5DhwrcKy-NHUkLUmFQpNj-1g&libraries=places', function() {
					autocompleteService = new google.maps.places.AutocompleteService();
				}
			);
		} );
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
		if ( query ) {
			autocompleteService.getQueryPredictions( { input: query }, this.updatePredictions );
		} else {
			this.updatePredictions( [] );
		}
	};

	render() {
		const { translate, siteId } = this.props;
		const { predictions } = this.state;
		const verifyHref = '/google-my-business/verify/' + siteId;
		const createHref = '/google-my-business/create/' + siteId;
		return (
			<div className="search-for-a-location">
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card className="search-for-a-location__search-section">
					<p>What is the name of your business?</p>
					<SearchCard
						onSearch={ this.handleSearch }
						className="search-for-a-location__search-card is-compact"
					/>

					{ predictions &&
						predictions.map( prediction => {
							return (
								<CompactCard key={ prediction.place_id }>
									<GoogleMyBusinessLocation
										title={ prediction.structured_formatting.main_text }
										text={ <p>{ prediction.structured_formatting.secondary_text }</p> }
										href={ verifyHref }
									/>
								</CompactCard>
							);
						} ) }
				</Card>

				<Card>
					Can't find your business? <a href={ createHref }>Create a new listing.</a>
				</Card>
			</div>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( SearchForALocation ) );
