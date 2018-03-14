/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import page from 'page';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import Card from 'components/card';
import HeaderCake from 'components/header-cake';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import Main from 'components/main';
import SearchCard from 'components/search-card';
import StepNavigation from '../step-navigation';
import Suggestions from 'components/suggestions';

class GoogleMyBusinessCategory extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static hints = [
		'accounting',
		'airport',
		'amusement_park',
		'aquarium',
		'art_gallery',
		'atm',
		'bakery',
		'bank',
		'bar',
		'beauty_salon',
		'bicycle_store',
		'book_store',
		'bowling_alley',
		'bus_station',
		'cafe',
		'campground',
		'car_dealer',
		'car_rental',
		'car_repair',
		'car_wash',
		'casino',
		'cemetery',
		'church',
		'city_hall',
		'clothing_store',
		'convenience_store',
		'courthouse',
		'dentist',
		'department_store',
		'doctor',
		'electrician',
		'electronics_store',
		'embassy',
		'fire_station',
		'florist',
		'funeral_home',
		'furniture_store',
		'gas_station',
		'gym',
		'hair_care',
		'hardware_store',
		'hindu_temple',
		'home_goods_store',
		'hospital',
		'insurance_agency',
		'jewelry_store',
		'laundry',
		'lawyer',
		'library',
		'liquor_store',
		'local_government_office',
		'locksmith',
		'lodging',
		'meal_delivery',
		'meal_takeaway',
		'mosque',
		'movie_rental',
		'movie_theater',
		'moving_company',
		'museum',
		'night_club',
		'painter',
		'park',
		'parking',
		'pet_store',
		'pharmacy',
		'physiotherapist',
		'plumber',
		'police',
		'post_office',
		'real_estate_agency',
		'restaurant',
		'roofing_contractor',
		'rv_park',
		'school',
		'shoe_store',
		'shopping_mall',
		'spa',
		'stadium',
		'storage',
		'store',
		'subway_station',
		'supermarket',
		'synagogue',
		'taxi_stand',
		'train_station',
		'transit_station',
		'travel_agency',
		'veterinary_care',
		'zoo',
	];

	state = {
		query: '',
	};

	setSuggestionsRef = ref => ( this.suggestionsRef = ref );

	hideSuggestions = () => this.setState( { query: '' } );

	handleSearch = query => this.setState( { query: query } );

	handleKeyDown = event => this.suggestionsRef.handleKeyEvent( event );

	getSuggestions() {
		return GoogleMyBusinessCategory.hints
			.filter( hint => this.state.query && hint.match( new RegExp( this.state.query, 'i' ) ) )
			.map( hint => ( { label: hint } ) );
	}

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;
		const nextHref = '/google-my-business/connections/' + siteId;
		const backHref = '/google-my-business/address/' + siteId;

		return (
			<Main className="google-my-business google-my-business-category">
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card>
					<FormFieldset>
						<FormLegend>What kind of business do you run?</FormLegend>

						<p>
							Correct category selection helps you attract customers searching for businesses like
							yours in your area. Select a category that best matches your business. Learn more
						</p>

						<SearchCard
							disableAutocorrect
							onSearch={ this.handleSearch }
							onBlur={ this.hideSuggestions }
							onKeyDown={ this.handleKeyDown }
							placeholder="Type something..."
						/>
						<Suggestions
							ref={ this.setSuggestionsRef }
							query={ this.state.query }
							suggestions={ this.getSuggestions() }
							suggest={ noop }
						/>
					</FormFieldset>
				</Card>

				<StepNavigation value={ 50 } total={ 100 } backHref={ backHref } nextHref={ nextHref } />
			</Main>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( GoogleMyBusinessCategory ) );
