/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, isEmpty } from 'lodash';
import Gridicon from 'calypso/components/gridicon';
import page from 'page';
import { stringify } from 'qs';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { getProductsList } from 'calypso/state/products-list/selectors';
import {
	currentUserHasFlag,
	getCurrentUser,
	getCurrentUserCurrencyCode,
} from 'calypso/state/current-user/selectors';
import { Card, Button } from '@automattic/components';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import {
	CALYPSO_CONTACT,
	INCOMING_DOMAIN_TRANSFER,
	MAP_EXISTING_DOMAIN,
} from 'calypso/lib/url/support';
import HeaderCake from 'calypso/components/header-cake';
import { errorNotice } from 'calypso/state/notices/actions';
import QueryProducts from 'calypso/components/data/query-products-list';
import {
	getDomainPrice,
	getDomainProductSlug,
	getDomainTransferSalePrice,
} from 'calypso/lib/domains';
import {
	isDomainBundledWithPlan,
	isDomainMappingFree,
	isNextDomainFree,
} from 'calypso/lib/cart-values/cart-items';
import { isPlan } from '@automattic/calypso-products';
import {
	DOMAINS_WITH_PLANS_ONLY,
	NON_PRIMARY_DOMAINS_TO_FREE_USERS,
} from 'calypso/state/current-user/constants';
import { withShoppingCart } from '@automattic/shopping-cart';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import themesImage from 'calypso/assets/images/illustrations/themes.svg';
import migratingHostImage from 'calypso/assets/images/illustrations/migrating-host-diy.svg';

const noop = () => {};

class UseYourDomainStep extends React.Component {
	static propTypes = {
		analyticsSection: PropTypes.string.isRequired,
		basePath: PropTypes.string,
		cart: PropTypes.object,
		domainsWithPlansOnly: PropTypes.bool,
		primaryWithPlansOnly: PropTypes.bool,
		goBack: PropTypes.func,
		initialQuery: PropTypes.string,
		isSignupStep: PropTypes.bool,
		mapDomainUrl: PropTypes.string,
		transferDomainUrl: PropTypes.string,
		onRegisterDomain: PropTypes.func,
		onTransferDomain: PropTypes.func,
		onSave: PropTypes.func,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		forcePrecheck: PropTypes.bool,
	};

	static defaultProps = {
		analyticsSection: 'domains',
		onSave: noop,
	};

	state = this.getDefaultState();

	getDefaultState() {
		return {
			authCodeValid: null,
			domain: null,
			domainsWithPlansOnly: false,
			inboundTransferStatus: {},
			precheck: get( this.props, 'forcePrecheck', false ),
			searchQuery: this.props.initialQuery || '',
			submittingAuthCodeCheck: false,
			submittingAvailability: false,
			submittingWhois: get( this.props, 'forcePrecheck', false ),
			supportsPrivacy: false,
		};
	}

	getMapDomainUrl() {
		const { basePath, mapDomainUrl, selectedSite } = this.props;
		if ( mapDomainUrl ) {
			return mapDomainUrl;
		}

		let buildMapDomainUrl;
		const basePathForMapping = basePath?.endsWith( '/use-your-domain' )
			? basePath.substring( 0, basePath.length - 16 )
			: basePath;

		buildMapDomainUrl = `${ basePathForMapping }/mapping`;
		if ( selectedSite ) {
			const query = stringify( { initialQuery: this.state.searchQuery.trim() } );
			buildMapDomainUrl += `/${ selectedSite.slug }?${ query }`;
		}

		return buildMapDomainUrl;
	}

	goToMapDomainStep = ( event ) => {
		event.preventDefault();

		this.props.recordMappingButtonClickInUseYourDomain( this.props.analyticsSection );

		page( this.getMapDomainUrl() );
	};

	getTransferDomainUrl() {
		const { basePath, transferDomainUrl, selectedSite } = this.props;

		if ( transferDomainUrl ) {
			return transferDomainUrl;
		}

		let buildTransferDomainUrl;
		const basePathForTransfer = basePath?.endsWith( '/use-your-domain' )
			? basePath.substring( 0, basePath.length - 16 )
			: basePath;

		buildTransferDomainUrl = `${ basePathForTransfer }/transfer`;

		if ( selectedSite ) {
			const query = stringify( {
				initialQuery: this.state.searchQuery.trim(),
				useStandardBack: true,
			} );
			buildTransferDomainUrl += `/${ selectedSite.slug }?${ query }`;
		}

		return buildTransferDomainUrl;
	}

	goToTransferDomainStep = ( event ) => {
		event.preventDefault();

		this.props.recordTransferButtonClickInUseYourDomain( this.props.analyticsSection );

		page( this.getTransferDomainUrl() );
	};

	goBack = () => {
		this.props.goBack();
	};

	getTransferFreeText = () => {
		const { cart, translate, domainsWithPlansOnly, isSignupStep, selectedSite } = this.props;
		const { searchQuery } = this.state;
		const domainsWithPlansOnlyButNoPlan =
			domainsWithPlansOnly && ( ( selectedSite && ! isPlan( selectedSite.plan ) ) || isSignupStep );

		let domainProductFreeText = null;

		if ( isNextDomainFree( cart ) || isDomainBundledWithPlan( cart, searchQuery ) ) {
			domainProductFreeText = translate( 'Free with your plan' );
		} else if ( domainsWithPlansOnlyButNoPlan ) {
			domainProductFreeText = translate( 'Included in paid plans' );
		}

		return domainProductFreeText;
	};

	getTransferSalePriceText = () => {
		const {
			cart,
			currencyCode,
			translate,
			domainsWithPlansOnly,
			isSignupStep,
			productsList,
			selectedSite,
		} = this.props;
		const { searchQuery } = this.state;
		const productSlug = getDomainProductSlug( searchQuery );
		const domainsWithPlansOnlyButNoPlan =
			domainsWithPlansOnly && ( ( selectedSite && ! isPlan( selectedSite.plan ) ) || isSignupStep );
		const domainProductSalePrice = getDomainTransferSalePrice(
			productSlug,
			productsList,
			currencyCode
		);

		if (
			isEmpty( domainProductSalePrice ) ||
			isNextDomainFree( cart ) ||
			isDomainBundledWithPlan( cart, searchQuery ) ||
			domainsWithPlansOnlyButNoPlan
		) {
			return;
		}

		return translate( 'Sale price is %(cost)s', { args: { cost: domainProductSalePrice } } );
	};

	getTransferPriceText = () => {
		const {
			cart,
			currencyCode,
			translate,
			domainsWithPlansOnly,
			isSignupStep,
			productsList,
			selectedSite,
		} = this.props;
		const { searchQuery } = this.state;
		const productSlug = getDomainProductSlug( searchQuery );
		const domainsWithPlansOnlyButNoPlan =
			domainsWithPlansOnly && ( ( selectedSite && ! isPlan( selectedSite.plan ) ) || isSignupStep );

		const domainProductPrice = getDomainPrice( productSlug, productsList, currencyCode );

		if (
			domainProductPrice &&
			( isNextDomainFree( cart ) ||
				isDomainBundledWithPlan( cart, searchQuery ) ||
				domainsWithPlansOnlyButNoPlan ||
				getDomainTransferSalePrice( productSlug, productsList, currencyCode ) )
		) {
			return translate( 'Renews at %(cost)s', { args: { cost: domainProductPrice } } );
		}

		if ( domainProductPrice ) {
			return translate( '%(cost)s per year', { args: { cost: domainProductPrice } } );
		}
	};

	getMappingPriceText = () => {
		const {
			cart,
			currencyCode,
			domainsWithPlansOnly,
			primaryWithPlansOnly,
			productsList,
			selectedSite,
			translate,
		} = this.props;
		const { searchQuery } = this.state;

		let mappingProductPrice;

		const price = get( productsList, [ 'domain_map', 'cost' ], null );
		if ( price ) {
			mappingProductPrice = formatCurrency( price, currencyCode );
			mappingProductPrice = translate(
				'%(cost)s per year plus registration costs at your current provider',
				{ args: { cost: mappingProductPrice } }
			);
		}

		if (
			isDomainMappingFree( selectedSite ) ||
			isNextDomainFree( cart ) ||
			isDomainBundledWithPlan( cart, searchQuery )
		) {
			mappingProductPrice = translate(
				'Free with your plan, but registration costs at your current provider still apply'
			);
		} else if ( domainsWithPlansOnly || primaryWithPlansOnly ) {
			mappingProductPrice = translate(
				'Included in annual paid plans, but registration costs at your current provider still apply'
			);
		}

		return mappingProductPrice;
	};

	renderIllustration = ( image ) => {
		return (
			<div className="use-your-domain-step__option-illustration">
				<img src={ image } alt="" />
			</div>
		);
	};

	renderOptionTitle = ( optionTitle ) => {
		return <h3 className="use-your-domain-step__option-title">{ optionTitle }</h3>;
	};

	renderOptionReasons = ( optionReasons ) => {
		return (
			<div className="use-your-domain-step__option-reasons">
				{ optionReasons.map( ( phrase, index ) => {
					if ( isEmpty( phrase ) ) {
						return;
					}

					return (
						<div className="use-your-domain-step__option-reason" key={ index }>
							<Gridicon icon="checkmark" size={ 18 } />
							{ phrase }
						</div>
					);
				} ) }
			</div>
		);
	};

	renderOptionContent = ( content ) => {
		const { image, title, reasons, onClick, buttonText, isPrimary, learnMore } = content;
		return (
			<Card className="use-your-domain-step__option" compact>
				<div className="use-your-domain-step__option-inner-wrap">
					<div className="use-your-domain-step__option-content">
						{ this.renderIllustration( image ) }
						{ this.renderOptionTitle( title ) }
						{ this.renderOptionReasons( reasons ) }
					</div>
					<div className="use-your-domain-step__option-action">
						{ this.renderOptionButton( { onClick, buttonText, isPrimary } ) }
						<div className="use-your-domain-step__learn-more">{ learnMore }</div>
					</div>
				</div>
			</Card>
		);
	};

	renderOptionButton = ( buttonOptions ) => {
		const { buttonText, onClick, isPrimary } = buttonOptions;
		const { submittingAvailability, submittingWhois } = this.state;
		const submitting = submittingAvailability || submittingWhois;
		return (
			<Button
				className="use-your-domain-step__option-button"
				primary={ isPrimary }
				onClick={ onClick }
				busy={ submitting }
			>
				{ buttonText }
			</Button>
		);
	};

	renderSelectTransfer = () => {
		const { translate } = this.props;

		const image = migratingHostImage;
		const title = translate( 'Transfer your domain away from your current registrar.' );
		const reasons = [
			translate(
				'Domain registration and billing will be moved from your current provider to WordPress.com'
			),
			translate( 'Manage your domain and site from your WordPress.com dashboard' ),
			translate( 'Extends registration by one year' ),
			this.getTransferFreeText(),
			this.getTransferSalePriceText(),
			this.getTransferPriceText(),
		];
		const buttonText = translate( 'Transfer to WordPress.com' );
		const learnMore = translate( '{{a}}Learn more about domain transfers{{/a}}', {
			components: {
				a: <a href={ INCOMING_DOMAIN_TRANSFER } rel="noopener noreferrer" target="_blank" />,
			},
		} );

		return this.renderOptionContent( {
			image,
			title,
			reasons,
			onClick: this.goToTransferDomainStep,
			buttonText,
			isPrimary: true,
			learnMore,
		} );
	};

	renderSelectMapping = () => {
		const { translate } = this.props;
		const image = themesImage;
		const title = translate( 'Map your domain without moving it from your current registrar.' );
		const reasons = [
			translate( 'Domain registration and billing will remain at your current provider' ),
			translate( 'Manage some domain settings at your current provider and some at WordPress.com' ),
			// translate( 'Continue paying for your domain registration at your current provider' ),
			translate( "Requires changes to the domain's DNS" ),
			this.getMappingPriceText(),
		];
		const buttonText = translate( 'Map your domain' );
		const learnMore = translate( '{{a}}Learn more about domain mapping{{/a}}', {
			components: {
				a: <a href={ MAP_EXISTING_DOMAIN } rel="noopener noreferrer" target="_blank" />,
			},
		} );

		return this.renderOptionContent( {
			image,
			title,
			reasons,
			onClick: this.goToMapDomainStep,
			buttonText,
			isPrimary: false,
			learnMore,
		} );
	};

	render() {
		const { isSignupStep, translate } = this.props;

		const header = ! isSignupStep && (
			<HeaderCake onClick={ this.goBack }>
				{ this.props.translate( 'Use My Own Domain' ) }
			</HeaderCake>
		);

		return (
			<div className="use-your-domain-step">
				{ header }
				<QueryProducts />
				<div className="use-your-domain-step__content">
					{ this.renderSelectTransfer() }
					{ this.renderSelectMapping() }
				</div>
				<p className="use-your-domain-step__footer">
					{ translate( "Not sure what works best for you? {{a}}We're happy to help!{{/a}}", {
						components: {
							a: <a href={ CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer" />,
						},
					} ) }
				</p>
			</div>
		);
	}
}

const recordTransferButtonClickInUseYourDomain = ( domain_name ) =>
	recordTracksEvent( 'calypso_use_your_domain_transfer_click', { domain_name } );

const recordMappingButtonClickInUseYourDomain = ( domain_name ) =>
	recordTracksEvent( 'calypso_use_your_domain_mapping_click', { domain_name } );

export default connect(
	( state ) => ( {
		currentUser: getCurrentUser( state ),
		currencyCode: getCurrentUserCurrencyCode( state ),
		domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
		primaryWithPlansOnly: currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS ),
		selectedSite: getSelectedSite( state ),
		productsList: getProductsList( state ),
	} ),
	{
		errorNotice,
		recordTransferButtonClickInUseYourDomain,
		recordMappingButtonClickInUseYourDomain,
	}
)( withShoppingCart( localize( UseYourDomainStep ) ) );
