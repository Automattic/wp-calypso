/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { includes, isNumber } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DomainSuggestion from 'components/domains/domain-suggestion';
import DomainSuggestionFlag from 'components/domains/domain-suggestion-flag';
import { shouldBundleDomainWithPlan, getDomainPriceRule, hasDomainInCart } from 'lib/cart-values/cart-items';
import { recordTracksEvent } from 'state/analytics/actions';

const newTLDs = [
	'.rocks',
	'.site',
	'.cloud',
	'.club',
	'.today',
	'.tube',
	'.xyz',
	'.shop',
	'.academy',
	'.accountants',
	'.agency',
	'.apartments',
	'.associates',
	'.bargains',
	'.bike',
	'.bingo',
	'.boutique',
	'.builders',
	'.business',
	'.ca',
	'.cafe',
	'.camera',
	'.camp',
	'.capital',
	'.cards',
	'.care',
	'.careers',
	'.cash',
	'.casino',
	'.catering',
	'.center',
	'.chat',
	'.cheap',
	'.church',
	'.city',
	'.claims',
	'.cleaning',
	'.clinic',
	'.clothing',
	'.coach',
	'.codes',
	'.coffee',
	'.community',
	'.company',
	'.computer',
	'.condos',
	'.construction',
	'.contractors',
	'.cool',
	'.coupons',
	'.credit',
	'.creditcard',
	'.cruises',
	'.dating',
	'.deals',
	'.delivery',
	'.dental',
	'.diamonds',
	'.digital',
	'.direct',
	'.directory',
	'.discount',
	'.doctor',
	'.dog',
	'.domains',
	'.education',
	'.email',
	'.energy',
	'.engineering',
	'.enterprises',
	'.equipment',
	'.estate',
	'.events',
	'.exchange',
	'.expert',
	'.exposed',
	'.express',
	'.fail',
	'.farm',
	'.finance',
	'.financial',
	'.fish',
	'.fitness',
	'.flights',
	'.florist',
	'.football',
	'.foundation',
	'.fr',
	'.fund',
	'.furniture',
	'.fyi',
	'.gallery',
	'.gifts',
	'.glass',
	'.gmbh',
	'.gold',
	'.graphics',
	'.gratis',
	'.gripe',
	'.guide',
	'.guru',
	'.healthcare',
	'.hockey',
	'.holdings',
	'.holiday',
	'.house',
	'.immo',
	'.industries',
	'.institute',
	'.insure',
	'.international',
	'.investments',
	'.jewelry',
	'.kitchen',
	'.land',
	'.lease',
	'.legal',
	'.life',
	'.lighting',
	'.limited',
	'.limo',
	'.loans',
	'.ltd',
	'.maison',
	'.management',
	'.marketing',
	'.mba',
	'.media',
	'.memorial',
	'.partners',
	'.parts',
	'.photography',
	'.photos',
	'.pictures',
	'.pizza',
	'.place',
	'.plumbing',
	'.plus',
	'.productions',
	'.properties',
	'.recipes',
	'.reise',
	'.reisen',
	'.rentals',
	'.repair',
	'.report',
	'.restaurant',
	'.run',
	'.salon',
	'.sarl',
	'.school',
	'.schule',
	'.services',
	'.shoes',
	'.shopping',
	'.show',
	'.singles',
	'.soccer',
	'.solar',
	'.solutions',
	'.supplies',
	'.supply',
	'.support',
	'.surgery',
	'.systems',
	'.tax',
	'.taxi',
	'.team',
	'.technology',
	'.tennis',
	'.theater',
	'.tienda',
	'.tips',
	'.tires',
	'.today',
	'.tools',
	'.tours',
	'.town',
	'.toys',
	'.training',
	'.university',
	'.vacations',
	'.ventures',
	'.viajes',
	'.villas',
	'.vin',
	'.vision',
	'.voyage',
	'.watch',
	'.wine',
	'.works',
	'.world',
	'.wtf',
	'.zone',
	'.fun',
	'.host',
	'.online',
	'.press',
	'.site',
	'.space',
	'.store',
	'.tech',
	'.website',
	'.actor',
	'.airforce',
	'.army',
	'.attorney',
	'.auction',
	'.band',
	'.consulting',
	'.dance',
	'.degree',
	'.democrat',
	'.dentist',
	'.family',
	'.forsale',
	'.futbol',
	'.games',
	'.gives',
	'.haus',
	'.immobilien',
	'.kaufen',
	'.lawyer',
	'.engineer',
	'.market',
	'.moda',
	'.mortgage',
	'.navy',
	'.news',
	'.ninja',
	'.pub',
	'.rehab',
	'.republican',
	'.reviews',
	'.rip',
	'.rocks',
	'.sale',
	'.social',
	'.software',
	'.studio',
	'.vet',
	'.video'
];

class DomainRegistrationSuggestion extends React.Component {
	static propTypes = {
		isSignupStep: PropTypes.bool,
		cart: PropTypes.object,
		suggestion: PropTypes.shape( {
			domain_name: PropTypes.string.isRequired,
			product_slug: PropTypes.string,
			cost: PropTypes.string
		} ).isRequired,
		onButtonClick: PropTypes.func.isRequired,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		selectedSite: PropTypes.object,
		railcarId: PropTypes.string,
		recordTracksEvent: PropTypes.func,
		uiPosition: PropTypes.number,
		fetchAlgo: PropTypes.string,
		query: PropTypes.string
	};

	componentDidMount() {
		if ( this.props.railcarId && isNumber( this.props.uiPosition ) ) {
			let resultSuffix = '';
			if ( this.props.suggestion.isRecommended ) {
				resultSuffix = '#recommended';
			} else if ( this.props.suggestion.isBestAlternative ) {
				resultSuffix = '#best-alternative';
			}

			this.props.recordTracksEvent( 'calypso_traintracks_render', {
				railcar: this.props.railcarId,
				ui_position: this.props.uiPosition,
				fetch_algo: this.props.fetchAlgo,
				rec_result: `${ this.props.suggestion.domain_name }${ resultSuffix }`,
				fetch_query: this.props.query
			} );
		}
	}

	onButtonClick = () => {
		if ( this.props.railcarId ) {
			this.props.recordTracksEvent( 'calypso_traintracks_interact', {
				railcar: this.props.railcarId,
				action: 'domain_added_to_cart'
			} );
		}

		this.props.onButtonClick( this.props.suggestion );
	};

	render() {
		const { cart, domainsWithPlansOnly, isSignupStep, selectedSite, suggestion, translate } = this.props;
		const domain = suggestion.domain_name;
		const isAdded = hasDomainInCart( cart, domain );
		const domainFlags = [];

		let buttonClasses, buttonContent;

		if ( domain ) {
			const testTLDs = [ '.de' ];
			// Grab everything after the first dot, so 'example.co.uk' will
			// match '.co.uk' but not '.uk'
			// This won't work if we add subdomains.
			const tld = domain.substring( domain.indexOf( '.' ) );

			if ( includes( newTLDs, tld ) ) {
				domainFlags.push(
					<DomainSuggestionFlag
						key={ `${ domain }-new` }
						content={ translate( 'New' ) }
						status="success"
					/>
				);
			}

			if ( includes( testTLDs, tld ) ) {
				domainFlags.push(
					<DomainSuggestionFlag
						key={ `${ domain }-testing` }
						content={ 'Testing only' }
						status="warning"
					/>
				);
			}
		}

		if ( suggestion.isRecommended ) {
			domainFlags.push(
				<DomainSuggestionFlag
					key={ `${ domain }-recommended` }
					content={ translate( 'Recommended' ) }
					status="success"
				/>
			);
		}

		if ( suggestion.isBestAlternative ) {
			domainFlags.push(
				<DomainSuggestionFlag
					key={ `${ domain }-best-alternative` }
					content={ translate( 'Best Alternative' ) }
				/>
			);
		}

		if ( isAdded ) {
			buttonClasses = 'added';
			buttonContent = <Gridicon icon="checkmark" />;
		} else {
			buttonClasses = 'add is-primary';
			buttonContent = ! isSignupStep && shouldBundleDomainWithPlan( domainsWithPlansOnly, selectedSite, cart, suggestion )
				? translate( 'Upgrade', { context: 'Domain mapping suggestion button with plan upgrade' } )
				: translate( 'Select', { context: 'Domain mapping suggestion button' } );
		}

		return (
			<DomainSuggestion
					priceRule={ getDomainPriceRule( domainsWithPlansOnly, selectedSite, cart, suggestion ) }
					price={ suggestion.product_slug && suggestion.cost }
					domain={ domain }
					buttonClasses={ buttonClasses }
					buttonContent={ buttonContent }
					cart={ cart }
					domainsWithPlansOnly={ domainsWithPlansOnly }
					onButtonClick={ this.onButtonClick }>
				<h3>
					{ domain }
					{ domainFlags }
				</h3>
			</DomainSuggestion>
		);
	}
}

export default connect(
	null,
	{ recordTracksEvent }
)( localize( DomainRegistrationSuggestion ) );
