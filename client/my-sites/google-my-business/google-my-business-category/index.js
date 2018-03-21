/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import Card from 'components/card';
import HeaderCake from 'components/header-cake';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
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
		{ value: 'accounting', label: 'Accounting' },
		{ value: 'airport', label: 'Airport' },
		{ value: 'amusement_park', label: 'Amusement Park' },
		{ value: 'aquarium', label: 'Aquarium' },
		{ value: 'art_gallery', label: 'Art Gallery' },
		{ value: 'atm', label: 'Atm' },
		{ value: 'bakery', label: 'Bakery' },
		{ value: 'bank', label: 'Bank' },
		{ value: 'bar', label: 'Bar' },
		{ value: 'beauty_salon', label: 'Beauty Salon' },
		{ value: 'bicycle_store', label: 'Bicycle Store' },
		{ value: 'book_store', label: 'Book Store' },
		{ value: 'bowling_alley', label: 'Bowling Alley' },
		{ value: 'bus_station', label: 'Bus Station' },
		{ value: 'cafe', label: 'Cafe' },
		{ value: 'campground', label: 'Campground' },
		{ value: 'car_dealer', label: 'Car Dealer' },
		{ value: 'car_rental', label: 'Car Rental' },
		{ value: 'car_repair', label: 'Car Repair' },
		{ value: 'car_wash', label: 'Car Wash' },
		{ value: 'casino', label: 'Casino' },
		{ value: 'cemetery', label: 'Cemetery' },
		{ value: 'church', label: 'Church' },
		{ value: 'city_hall', label: 'City Hall' },
		{ value: 'clothing_store', label: 'Clothing Store' },
		{ value: 'convenience_store', label: 'Convenience Store' },
		{ value: 'courthouse', label: 'Courthouse' },
		{ value: 'dentist', label: 'Dentist' },
		{ value: 'department_store', label: 'Department Store' },
		{ value: 'doctor', label: 'Doctor' },
		{ value: 'electrician', label: 'Electrician' },
		{ value: 'electronics_store', label: 'Electronics Store' },
		{ value: 'embassy', label: 'Embassy' },
		{ value: 'fire_station', label: 'Fire Station' },
		{ value: 'florist', label: 'Florist' },
		{ value: 'funeral_home', label: 'Funeral Home' },
		{ value: 'furniture_store', label: 'Furniture Store' },
		{ value: 'gas_station', label: 'Gas Station' },
		{ value: 'gym', label: 'Gym' },
		{ value: 'hair_care', label: 'Hair Care' },
		{ value: 'hardware_store', label: 'Hardware Store' },
		{ value: 'hindu_temple', label: 'Hindu Temple' },
		{ value: 'home_goods_store', label: 'Home Goods Store' },
		{ value: 'hospital', label: 'Hospital' },
		{ value: 'insurance_agency', label: 'Insurance Agency' },
		{ value: 'jewelry_store', label: 'Jewelry Store' },
		{ value: 'laundry', label: 'Laundry' },
		{ value: 'lawyer', label: 'Lawyer' },
		{ value: 'library', label: 'Library' },
		{ value: 'liquor_store', label: 'Liquor Store' },
		{ value: 'local_government_office', label: 'Local Government Office' },
		{ value: 'locksmith', label: 'Locksmith' },
		{ value: 'lodging', label: 'Lodging' },
		{ value: 'meal_delivery', label: 'Meal Delivery' },
		{ value: 'meal_takeaway', label: 'Meal Takeaway' },
		{ value: 'mosque', label: 'Mosque' },
		{ value: 'movie_rental', label: 'Movie Rental' },
		{ value: 'movie_theater', label: 'Movie Theater' },
		{ value: 'moving_company', label: 'Moving Company' },
		{ value: 'museum', label: 'Museum' },
		{ value: 'night_club', label: 'Night Club' },
		{ value: 'painter', label: 'Painter' },
		{ value: 'park', label: 'Park' },
		{ value: 'parking', label: 'Parking' },
		{ value: 'pet_store', label: 'Pet Store' },
		{ value: 'pharmacy', label: 'Pharmacy' },
		{ value: 'physiotherapist', label: 'Physiotherapist' },
		{ value: 'plumber', label: 'Plumber' },
		{ value: 'police', label: 'Police' },
		{ value: 'post_office', label: 'Post Office' },
		{ value: 'real_estate_agency', label: 'Real Estate Agency' },
		{ value: 'restaurant', label: 'Restaurant' },
		{ value: 'roofing_contractor', label: 'Roofing Contractor' },
		{ value: 'rv_park', label: 'Rv Park' },
		{ value: 'school', label: 'School' },
		{ value: 'shoe_store', label: 'Shoe Store' },
		{ value: 'shopping_mall', label: 'Shopping Mall' },
		{ value: 'spa', label: 'Spa' },
		{ value: 'stadium', label: 'Stadium' },
		{ value: 'storage', label: 'Storage' },
		{ value: 'store', label: 'Store' },
		{ value: 'subway_station', label: 'Subway Station' },
		{ value: 'supermarket', label: 'Supermarket' },
		{ value: 'synagogue', label: 'Synagogue' },
		{ value: 'taxi_stand', label: 'Taxi Stand' },
		{ value: 'train_station', label: 'Train Station' },
		{ value: 'transit_station', label: 'Transit Station' },
		{ value: 'travel_agency', label: 'Travel Agency' },
		{ value: 'veterinary_care', label: 'Veterinary Care' },
		{ value: 'zoo', label: 'Zoo' },
	];

	state = {
		query: '',
		category: '',
	};

	setSuggestionsRef = ref => ( this.suggestionsRef = ref );

	hideSuggestions = () => this.setState( { query: '' } );

	handleSearch = query => this.setState( { query: query } );

	handleKeyDown = event => {
		this.setState( {
			category: null,
		} );
		this.suggestionsRef.handleKeyEvent( event );
	};

	getSuggestions() {
		return this.state.category
			? []
			: GoogleMyBusinessCategory.hints.filter(
					hint => this.state.query && hint.value.match( new RegExp( this.state.query, 'i' ) )
				);
	}

	selectSuggestion = suggestion => {
		this.setState( {
			category: suggestion.label,
			query: null,
		} );
	};

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;
		const nextHref = '/google-my-business/connections/' + siteId;
		const backHref = '/google-my-business/address/' + siteId;
		const learnMore =
			'https://support.google.com/business/answer/7249669?hl=en&_ga=2.170244832.1172336099.1521039613-786824372.1502702633';

		return (
			<Main className="google-my-business google-my-business-category" wideLayout>
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card>
					<FormFieldset>
						<FormLegend>What kind of business do you run?</FormLegend>

						<p>
							{ translate(
								'Correct category selection helps you attract ' +
									'customers searching for businesses like' +
									'yours in your area. Select a category that ' +
									'best matches your business. {{a}}Learn more{{/a}}',
								{
									components: {
										a: <a href={ learnMore } />,
									},
								}
							) }
						</p>

						<FormLabel>Business Category</FormLabel>
						<SearchCard
							disableAutocorrect
							onSearch={ this.handleSearch }
							onBlur={ this.hideSuggestions }
							onKeyDown={ this.handleKeyDown }
							placeholder="Type something..."
							value={ this.state.category }
						/>
						<Suggestions
							ref={ this.setSuggestionsRef }
							query={ this.state.query }
							suggestions={ this.getSuggestions() }
							suggest={ this.selectSuggestion }
						/>
					</FormFieldset>
				</Card>

				<StepNavigation value={ 50 } total={ 100 } backHref={ backHref } nextHref={ nextHref } />
			</Main>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( GoogleMyBusinessCategory ) );
