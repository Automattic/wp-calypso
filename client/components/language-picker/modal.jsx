/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import {
	find,
	includes,
	map,
	noop,
	partial,
	some,
} from 'lodash';

/**
 * Internal dependencies
 */
import { getGeoCountryShort } from 'state/geo/selectors';
import QueryGeo from 'components/data/query-geo';
import Dialog from 'components/dialog';
import SectionNav from 'components/section-nav';
import SectionNavTabs from 'components/section-nav/tabs';
import SectionNavTabItem from 'components/section-nav/item';
import Search from 'components/search';

/*
 * List of territories that languages are grouped into (displayed as tabs in the UI).
 * Source of this data is the CLDR database, namely the `node-cldr` NPM package.
 *
 * `subTerritories` properties map the territory names into numerical geographic region
 * codes according to the UN M49 (https://unstats.un.org/unsd/methodology/m49/) standard
 * that is used in the CLDR database data.
 *
 * To move languages between territories or to include a language in multiple territories
 * change the 'territories' arrays in language data in 'config/_shared.json'.
 *
 * Some languages, e.g., Esperanto are not included in any territory -- these are
 * discoverable only with search.
 *
 * `countries` is a list of countries in each region. It's used to map country code
 * retrieved from geolocation service into the name of the tab selected by default.
 */
const TERRITORIES = [
	{
		id: 'africa-middle-east',
		name: translate => translate( 'Africa and Middle East' ),
		subTerritories: [ '145', '002' ],
		countries: [
			'AE', 'AM', 'AZ', 'BH', 'CY', 'GE', 'IL', 'IQ', 'JO', 'KW',
			'LB', 'OM', 'PS', 'QA', 'SA', 'SY', 'TR', 'YE', 'DZ', 'EG',
			'EH', 'LY', 'MA', 'SD', 'TN', 'EA', 'IC', 'BF', 'BJ', 'CI',
			'CV', 'GH', 'GM', 'GN', 'GW', 'LR', 'ML', 'MR', 'NE', 'NG',
			'SH', 'SL', 'SN', 'TG', 'AO', 'CD', 'CF', 'CG', 'CM', 'GA',
			'GQ', 'ST', 'TD', 'BI', 'DJ', 'ER', 'ET', 'KE', 'KM', 'MG',
			'MU', 'MW', 'MZ', 'RE', 'RW', 'SC', 'SO', 'SS', 'TZ', 'UG',
			'YT', 'ZM', 'ZW', 'BW', 'LS', 'NA', 'SZ', 'ZA'
		],
	},
	{
		id: 'americas',
		name: translate => translate( 'Americas' ),
		subTerritories: [ '019' ],
		countries: [
			'BM', 'CA', 'GL', 'PM', 'US', 'BZ', 'CR', 'GT', 'HN', 'MX',
			'NI', 'PA', 'SV', 'AG', 'AI', 'AW', 'BB', 'BL', 'BQ', 'BS',
			'CU', 'CW', 'DM', 'DO', 'GD', 'GP', 'HT', 'JM', 'KN', 'KY',
			'LC', 'MF', 'MQ', 'MS', 'PR', 'SX', 'TC', 'TT', 'VC', 'VG',
			'VI', 'AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'FK', 'GF', 'GY',
			'PE', 'PY', 'SR', 'UY', 'VE'
		],
	},
	{
		id: 'asia-pacific',
		name: translate => translate( 'Asia-Pacific' ),
		subTerritories: [ '143', '009', '030', '034', '035' ],
		countries: [
			'TM', 'TJ', 'KG', 'KZ', 'UZ', 'AU', 'NF', 'NZ', 'FJ', 'NC',
			'PG', 'SB', 'VU', 'FM', 'GU', 'KI', 'MH', 'MP', 'NR', 'PW',
			'AS', 'CK', 'NU', 'PF', 'PN', 'TK', 'TO', 'TV', 'WF', 'WS',
			'QO', 'AQ', 'BV', 'CC', 'CX', 'GS', 'HM', 'IO', 'TF', 'UM',
			'AC', 'CP', 'DG', 'TA', 'CN', 'HK', 'JP', 'KP', 'KR', 'MN',
			'MO', 'TW', 'AF', 'BD', 'BT', 'IN', 'IR', 'LK', 'MV', 'NP',
			'PK', 'BN', 'ID', 'KH', 'LA', 'MM', 'MY', 'PH', 'SG', 'TH',
			'TL', 'VN' ],
	},
	{
		id: 'eastern-europe',
		name: translate => translate( 'Eastern Europe' ),
		subTerritories: [ '151' ],
		countries: [
			'BG', 'BY', 'CZ', 'HU', 'MD', 'PL', 'RO', 'RU', 'SK', 'UA'
		],
	},
	{
		id: 'western-europe',
		name: translate => translate( 'Western Europe' ),
		subTerritories: [ '154', '155', '039' ],
		countries: [
			'GG', 'IM', 'JE', 'AX', 'DK', 'EE', 'FI', 'FO', 'GB', 'IE',
			'IS', 'LT', 'LV', 'NO', 'SE', 'SJ', 'AT', 'BE', 'CH', 'DE',
			'FR', 'LI', 'LU', 'MC', 'NL', 'AD', 'AL', 'BA', 'ES', 'GI',
			'GR', 'HR', 'IT', 'ME', 'MK', 'MT', 'RS', 'PT', 'SI', 'SM',
			'VA', 'XK'
		],
	}
];

function getTerritoryFromCountry( countryCode ) {
	const territory = find( TERRITORIES, t => includes( t.countries, countryCode ) );
	return territory ? territory.id : 'asia-pacific';
}

class LanguagePickerModal extends PureComponent {
	static propTypes = {
		onSelected: PropTypes.func,
		onClose: PropTypes.func,
	}

	static defaultProps = {
		onSelected: noop,
		onClose: noop,
	}

	constructor( props ) {
		super( props );

		this.state = {
			filter: getTerritoryFromCountry( this.props.countryCode ),
			// reset to false after tab change initiated by user click. Until then,
			// we can change the default tab, e.g., after geolocation data arrives async.
			showingDefaultFilter: true,
			search: false,
			selectedLanguageSlug: this.props.selected,
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.selected !== this.state.selectedLanguageSlug ) {
			this.setState( {
				selectedLanguageSlug: nextProps.selected
			} );
		}

		if ( this.state.showingDefaultFilter && nextProps.countryCode !== this.props.countryCode ) {
			this.setState( {
				filter: getTerritoryFromCountry( nextProps.countryCode )
			} );
		}
	}

	getFilterLabel( filter ) {
		const territory = find( TERRITORIES, t => t.id === filter );
		if ( ! territory ) {
			return undefined;
		}

		// `territory.name` is a lambda that takes the `translate` function
		return territory.name( this.props.translate );
	}

	getFilterFunction() {
		const { search, filter } = this.state;

		if ( search ) {
			const searchString = search.toLowerCase();
			return language => includes( language.name.toLowerCase(), searchString );
		}

		if ( filter ) {
			const territory = find( TERRITORIES, t => t.id === filter );
			const subTerritories = territory ? territory.subTerritories : null;
			return language => some( language.territories, t => includes( subTerritories, t ) );
		}

		// By default, show all languages
		return Boolean;
	}

	getDisplayedLanguages() {
		const filterFn = this.getFilterFunction();
		const filteredLanguages = this.props.languages.filter( filterFn );
		filteredLanguages.sort( ( a, b ) => a.name.localeCompare( b.name ) );
		return filteredLanguages;
	}

	handleSearch = ( search ) => {
		this.setState( { search } );
	}

	handleClick = ( selectedLanguageSlug ) => {
		this.setState( { selectedLanguageSlug } );
	}

	handleSelectLanguage = () => {
		const langSlug = this.state.selectedLanguageSlug;
		this.props.onSelected( langSlug );
		this.handleClose();
	}

	handleClose = () => {
		this.props.onClose();
	}

	renderTabItems() {
		return map( TERRITORIES, territory => {
			const filter = territory.id;
			const selected = this.state.filter === filter;
			const onClick = () => this.setState( {
				filter,
				showingDefaultFilter: false,
			} );

			return (
				<SectionNavTabItem
					key={ filter }
					selected={ selected }
					onClick={ onClick }
				>
					{ this.getFilterLabel( filter ) }
				</SectionNavTabItem>
			);
		} );
	}

	renderLanguageList() {
		const languages = this.getDisplayedLanguages();

		return (
			<div className="language-picker__modal-list">
				{ map( languages, this.renderLanguageItem ) }
			</div>
		);
	}

	renderLanguageItem = ( language ) => {
		const isSelected = language.langSlug === this.state.selectedLanguageSlug;
		const classes = classNames( 'language-picker__modal-text', {
			'is-selected': isSelected
		} );

		return (
			<div
				className="language-picker__modal-item"
				key={ language.langSlug }
				onClick={ partial( this.handleClick, language.langSlug ) }
			>
				<span className={ classes }>{ language.name }</span>
			</div>
		);
	}

	render() {
		const { isVisible, translate } = this.props;

		const buttons = [
			{
				action: 'cancel',
				label: translate( 'Cancel' )
			},
			{
				action: 'confirm',
				label: translate( 'Select Language' ),
				isPrimary: true,
				onClick: this.handleSelectLanguage
			},
		];

		return (
			<Dialog
				isVisible={ isVisible }
				buttons={ buttons }
				onClose={ this.handleClose }
				additionalClassNames="language-picker__modal"
			>
				<QueryGeo />
				<SectionNav selectedText={ this.getFilterLabel( this.state.filter ) }>
					<SectionNavTabs>
						{ this.renderTabItems() }
					</SectionNavTabs>
					<Search
						pinned
						fitsContainer
						onSearch={ this.handleSearch }
						placeholder={ translate( 'Search languages…' ) }
					/>
				</SectionNav>
				{ this.renderLanguageList() }
			</Dialog>
		);
	}
}

export default connect(
	state => ( {
		countryCode: getGeoCountryShort( state ),
	} )
)( localize( LanguagePickerModal ) );
