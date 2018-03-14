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
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormStateSelector from 'components/forms/us-state-selector';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import FormToggle from 'components/forms/form-toggle';
import Main from 'components/main';
import StepNavigation from '../step-navigation';

class GoogleMyBusinessAddress extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		toggled: false,
	};

	handleToggle = () => {
		this.setState( { toggled: ! this.state.toggled } );
	};

	static countries = [
		'Afghanistan',
		'Åland Islands',
		'Albania',
		'Algeria',
		'American Samoa',
		'Andorra',
		'Angola',
		'Anguilla',
		'Antarctica',
		'Antigua &amp; Barbuda',
		'Argentina',
		'Armenia',
		'Aruba',
		'Ascension Island',
		'Australia',
		'Austria',
		'Azerbaijan',
		'Bahamas',
		'Bahrain',
		'Bangladesh',
		'Barbados',
		'Belarus',
		'Belgium',
		'Belize',
		'Benin',
		'Bermuda',
		'Bhutan',
		'Bolivia',
		'Bosnia &amp; Herzegovina',
		'Botswana',
		'Bouvet Island',
		'Brazil',
		'British Indian Ocean Territory',
		'British Virgin Islands',
		'Brunei',
		'Bulgaria',
		'Burkina Faso',
		'Burundi',
		'Cambodia',
		'Cameroon',
		'Canada',
		'Cape Verde',
		'Caribbean Netherlands',
		'Cayman Islands',
		'Central African Republic',
		'Chad',
		'Chile',
		'China',
		'Christmas Island',
		'Cocos (Keeling) Islands',
		'Colombia',
		'Comoros',
		'Congo - Brazzaville',
		'Congo - Kinshasa',
		'Cook Islands',
		'Costa Rica',
		'Côte d’Ivoire',
		'Croatia',
		'Curaçao',
		'Cyprus',
		'Czechia',
		'Denmark',
		'Djibouti',
		'Dominica',
		'Dominican Republic',
		'Ecuador',
		'Egypt',
		'El Salvador',
		'Equatorial Guinea',
		'Eritrea',
		'Estonia',
		'Ethiopia',
		'Falkland Islands (Islas Malvinas)',
		'Faroe Islands',
		'Fiji',
		'Finland',
		'France',
		'French Guiana',
		'French Polynesia',
		'French Southern Territories',
		'Gabon',
		'Gambia',
		'Georgia',
		'Germany',
		'Ghana',
		'Gibraltar',
		'Greece',
		'Greenland',
		'Grenada',
		'Guadeloupe',
		'Guam',
		'Guatemala',
		'Guernsey',
		'Guinea',
		'Guinea-Bissau',
		'Guyana',
		'Haiti',
		'Heard &amp; McDonald Islands',
		'Honduras',
		'Hong Kong',
		'Hungary',
		'Iceland',
		'India',
		'Indonesia',
		'Iran',
		'Iraq',
		'Ireland',
		'Isle of Man',
		'Israel',
		'Italy',
		'Jamaica',
		'Japan',
		'Jersey',
		'Jordan',
		'Kazakhstan',
		'Kenya',
		'Kiribati',
		'Kosovo',
		'Kuwait',
		'Kyrgyzstan',
		'Laos',
		'Latvia',
		'Lebanon',
		'Lesotho',
		'Liberia',
		'Libya',
		'Liechtenstein',
		'Lithuania',
		'Luxembourg',
		'Macau',
		'Macedonia (FYROM)',
		'Madagascar',
		'Malawi',
		'Malaysia',
		'Maldives',
		'Mali',
		'Malta',
		'Marshall Islands',
		'Martinique',
		'Mauritania',
		'Mauritius',
		'Mayotte',
		'Mexico',
		'Micronesia',
		'Moldova',
		'Monaco',
		'Mongolia',
		'Montenegro',
		'Montserrat',
		'Morocco',
		'Mozambique',
		'Myanmar (Burma)',
		'Namibia',
		'Nauru',
		'Nepal',
		'Netherlands',
		'New Caledonia',
		'New Zealand',
		'Nicaragua',
		'Niger',
		'Nigeria',
		'Niue',
		'Norfolk Island',
		'Northern Mariana Islands',
		'Norway',
		'Oman',
		'Pakistan',
		'Palau',
		'Palestine',
		'Panama',
		'Papua New Guinea',
		'Paraguay',
		'Peru',
		'Philippines',
		'Pitcairn Islands',
		'Poland',
		'Portugal',
		'Puerto Rico',
		'Qatar',
		'Réunion',
		'Romania',
		'Russia',
		'Rwanda',
		'Samoa',
		'San Marino',
		'São Tomé &amp; Príncipe',
		'Saudi Arabia',
		'Senegal',
		'Serbia',
		'Seychelles',
		'Sierra Leone',
		'Singapore',
		'Sint Maarten',
		'Slovakia',
		'Slovenia',
		'Solomon Islands',
		'Somalia',
		'South Africa',
		'South Georgia &amp; South Sandwich Islands',
		'South Korea',
		'South Sudan',
		'Spain',
		'Sri Lanka',
		'St. Barthélemy',
		'St. Helena',
		'St. Kitts &amp; Nevis',
		'St. Lucia',
		'St. Martin',
		'St. Pierre &amp; Miquelon',
		'St. Vincent &amp; Grenadines',
		'Suriname',
		'Svalbard &amp; Jan Mayen',
		'Swaziland',
		'Sweden',
		'Switzerland',
		'Taiwan',
		'Tajikistan',
		'Tanzania',
		'Thailand',
		'Timor-Leste',
		'Togo',
		'Tokelau',
		'Tonga',
		'Trinidad &amp; Tobago',
		'Tristan da Cunha',
		'Tunisia',
		'Turkey',
		'Turkmenistan',
		'Turks &amp; Caicos Islands',
		'Tuvalu',
		'U.S. Outlying Islands',
		'U.S. Virgin Islands',
		'Uganda',
		'Ukraine',
		'United Arab Emirates',
		'United Kingdom',
		'United States',
		'Uruguay',
		'Uzbekistan',
		'Vanuatu',
		'Vatican City',
		'Venezuela',
		'Vietnam',
		'Wallis &amp; Futuna',
		'Western Sahara',
		'Yemen',
		'Zambia',
		'Zimbabwe',
	];

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;
		const nextHref = '/google-my-business/category/' + siteId;
		const backHref = '/google-my-business/search-for-a-location/' + siteId;
		const learnMore = 'https://support.google.com/business/answer/3038163?hl=en&p=service_area&_ga=2.114817351.1172336099.1521039613-786824372.1502702633&visit_id=1-636566421185268799-1331387176&rd=1';

		return (
			<Main className="google-my-business google-my-business-address">
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card>
					<FormFieldset>
						<FormLegend>Where are you located?</FormLegend>

						<FormLabel>{ translate( 'Country' ) }</FormLabel>
						<FormSelect className="google-my-business-address__form-select">
							{ GoogleMyBusinessAddress.countries.map( ( country, index ) => {
								return <option key={ index }>{ country }</option>;
							} ) }
						</FormSelect>

						<FormLabel>{ translate( 'Street Address' ) }</FormLabel>
						<FormTextInput />

						<FormLabel>{ translate( 'City' ) }</FormLabel>
						<FormTextInput />

						<FormLabel>{ translate( 'State' ) }</FormLabel>
						<FormStateSelector
							name="state"
							onChange={ noop }
							className="form-select google-my-business-address__form-select"
						/>

						<FormLabel>{ translate( 'Postal code' ) }</FormLabel>
						<FormTextInput />

						<div className="google-my-business-address__form-toggle">
							<FormToggle checked={ this.state.toggled } onChange={ this.handleToggle } />
							<span>
								{ translate(
									'I deliver goods and services to my customers. {{a}}Learn more.{{/a}}',
									{
										components: {
											a: <a href={ learnMore } />,
										},
									}
								) }
							</span>
						</div>
					</FormFieldset>
				</Card>

				<StepNavigation value={ 20 } total={ 100 } backHref={ backHref } nextHref={ nextHref } />
			</Main>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( GoogleMyBusinessAddress ) );
