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
				'//maps.googleapis.com/maps/api/js?key=AIzaSyBO5-y0uPC5DhwrcKy-NHUkLUmFQpNj-1g&libraries=places',
				function() {
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
		const href = '/google-my-business/address/' + siteId;
		const predictionsMarkup =
			predictions &&
			predictions.map( prediction => {
				return (
					<CompactCard key={ prediction.place_id } href={ href }>
						{ prediction.structured_formatting.main_text }
						<p>{ prediction.structured_formatting.secondary_text }</p>
					</CompactCard>
				);
			} );
		const newListing = this.state.query ? (
			<CompactCard href={ href }>
				<p>
					{ this.state.query }
					<br />
					{ translate( 'Create new listing' ) }
				</p>
			</CompactCard>
		) : null;

		return (
			<div className="search-for-a-location">
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card className="search-for-a-location__search-section">
					<h1>What's the name of your business?</h1>
					<SearchCard
						onSearch={ this.handleSearch }
						inputLabel={ translate( 'Business name' ) }
						className="search-for-a-location__search-card is-compact"
					/>

					{ predictionsMarkup }

					{ newListing }

					<p className="search-for-a-location__search-tos">
						{ translate( 'By continuing you agree to the following Terms of Service' ) }
					</p>
				</Card>
			</div>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( SearchForALocation ) );
