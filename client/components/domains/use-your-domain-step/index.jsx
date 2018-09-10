/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { endsWith, get, isEmpty, noop } from 'lodash';
import GridiconCheckmark from 'gridicons/dist/checkmark';
import page from 'page';
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import { getProductsList } from 'state/products-list/selectors';
import { getCurrentUser, getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import Card from 'components/card';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';
import { CALYPSO_CONTACT, INCOMING_DOMAIN_TRANSFER, MAP_EXISTING_DOMAIN } from 'lib/url/support';
import HeaderCake from 'components/header-cake';
import Button from 'components/button';
import { errorNotice } from 'state/notices/actions';
import QueryProducts from 'components/data/query-products-list';
import { getDomainPrice, getDomainProductSlug } from 'lib/domains';
import { isDomainBundledWithPlan, isNextDomainFree } from 'lib/cart-values/cart-items';
import formatCurrency from 'lib/format-currency';
import { isPlan } from 'lib/products-values';

class UseYourDomainStep extends React.Component {
	static propTypes = {
		analyticsSection: PropTypes.string.isRequired,
		basePath: PropTypes.string,
		cart: PropTypes.object,
		domainsWithPlansOnly: PropTypes.bool,
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
		const basePathForMapping = endsWith( basePath, '/use-your-domain' )
			? basePath.substring( 0, basePath.length - 16 )
			: basePath;

		buildMapDomainUrl = `${ basePathForMapping }/mapping`;
		if ( selectedSite ) {
			const query = stringify( { initialQuery: this.state.searchQuery.trim() } );
			buildMapDomainUrl += `/${ selectedSite.slug }?${ query }`;
		}

		return buildMapDomainUrl;
	}

	goToMapDomainStep = event => {
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
		const basePathForTransfer = endsWith( basePath, '/use-your-domain' )
			? basePath.substring( 0, basePath.length - 16 )
			: basePath;

		buildTransferDomainUrl = `${ basePathForTransfer }/transfer`;

		if ( selectedSite ) {
			const query = stringify( { initialQuery: this.state.searchQuery.trim() } );
			buildTransferDomainUrl += `/${ selectedSite.slug }?${ query }`;
		}

		return buildTransferDomainUrl;
	}

	goToTransferDomainStep = event => {
		event.preventDefault();

		this.props.recordTransferButtonClickInUseYourDomain( this.props.analyticsSection );

		page( this.getTransferDomainUrl() );
	};

	goBack = () => {
		this.props.goBack();
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

		let domainProductPrice = getDomainPrice( productSlug, productsList, currencyCode );
		if ( domainProductPrice ) {
			domainProductPrice += ' per year';
		}

		if ( isNextDomainFree( cart ) || isDomainBundledWithPlan( cart, searchQuery ) ) {
			domainProductPrice = translate( 'Free with your plan' );
		} else if ( domainsWithPlansOnlyButNoPlan ) {
			domainProductPrice = translate( 'Included in paid plans' );
		}

		return domainProductPrice;
	};

	getMappingPriceText = () => {
		const { cart, currencyCode, productsList, translate } = this.props;
		const { searchQuery } = this.state;

		let mappingProductPrice;

		const price = get( productsList, [ 'domain_map', 'cost' ], null );
		if ( price ) {
			mappingProductPrice = formatCurrency( price, currencyCode );
			mappingProductPrice += ' per year plus registration costs at your current provider';
		}

		if ( isNextDomainFree( cart ) || isDomainBundledWithPlan( cart, searchQuery ) ) {
			mappingProductPrice = translate(
				'Free with your plan, but registration costs at your current provider still apply'
			);
		}

		return mappingProductPrice;
	};

	renderIllustration = image => {
		return (
			<div className="use-your-domain-step__option-illustration">
				<img src={ image } alt="" />
			</div>
		);
	};

	renderOptionTitle = optionTitle => {
		return <h3 className="use-your-domain-step__option-title">{ optionTitle }</h3>;
	};

	renderOptionReasons = optionReasons => {
		return (
			<div className="use-your-domain-step__option-reasons">
				{ optionReasons.map( ( phrase, index ) => {
					if ( isEmpty( phrase ) ) {
						return;
					}

					return (
						<div className="use-your-domain-step__option-reason" key={ index }>
							<GridiconCheckmark size={ 18 } />
							{ phrase }
						</div>
					);
				} ) }
			</div>
		);
	};

	renderOptionContent = content => {
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

	renderOptionButton = buttonOptions => {
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

		const image = '/calypso/images/illustrations/migrating-host-diy.svg';
		const title = translate( 'Transfer your domain away from your current registrar.' );
		const reasons = [
			translate(
				'Domain registration and billing will be moved from your current provider to WordPress.com'
			),
			translate( 'Manage your domain and site from your WordPress.com dashboard' ),
			translate( 'Extends registration by one year' ),
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
		const image = '/calypso/images/illustrations/jetpack-themes.svg';
		const title = translate( 'Map your domain without moving it from your current registrar.' );
		const reasons = [
			translate( 'Domain registration and billing will remain at your current provider' ),
			translate( 'Manage some domain settings at your current provider and some at WordPress.com' ),
			// translate( 'Continue paying for your domain registration at your current provider' ),
			translate( "Requires changes to the domain's DNS" ),
			this.getMappingPriceText(),
		];
		const buttonText = translate( 'Buy Domain Mapping' );
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

	useYourDomain = () => {
		const { translate } = this.props;

		return (
			<div>
				<QueryProducts />
				<div className="use-your-domain-step__content">
					{ this.renderSelectTransfer() }
					{ this.renderSelectMapping() }
				</div>
				<p className="use-your-domain-step__footer">
					{ translate( "Not sure what works best for you? {{a}}We're happy to help!{{/a}}", {
						components: {
							a: <a href={ CALYPSO_CONTACT } />,
						},
					} ) }
				</p>
			</div>
		);
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
							a: <a href={ CALYPSO_CONTACT } />,
						},
					} ) }
				</p>
			</div>
		);
	}
}

const recordTransferButtonClickInUseYourDomain = domain_name =>
	recordTracksEvent( 'calypso_use_your_domain_transfer_click', { domain_name } );

const recordMappingButtonClickInUseYourDomain = domain_name =>
	recordTracksEvent( 'calypso_use_your_domain_mapping_click', { domain_name } );

export default connect(
	state => ( {
		currentUser: getCurrentUser( state ),
		currencyCode: getCurrentUserCurrencyCode( state ),
		selectedSite: getSelectedSite( state ),
		productsList: getProductsList( state ),
	} ),
	{
		errorNotice,
		recordTransferButtonClickInUseYourDomain,
		recordMappingButtonClickInUseYourDomain,
	}
)( localize( UseYourDomainStep ) );
