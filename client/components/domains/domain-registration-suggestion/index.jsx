import { Badge, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { HUNDRED_YEAR_DOMAIN_FLOW } from '@automattic/onboarding';
import { HTTPS_SSL } from '@automattic/urls';
import clsx from 'clsx';
import { localize, formatCurrency } from 'i18n-calypso';
import { get, includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import {
	parseMatchReasons,
	VALID_MATCH_REASONS,
} from 'calypso/components/domains/domain-registration-suggestion/utility';
import DomainSuggestion from 'calypso/components/domains/domain-suggestion';
import InfoPopover from 'calypso/components/info-popover';
import {
	shouldBundleDomainWithPlan,
	getDomainPriceRule,
	hasDomainInCart,
	isPaidDomain,
} from 'calypso/lib/cart-values/cart-items';
import {
	getDomainPrice,
	getDomainSalePrice,
	getTld,
	isHstsRequired,
	isDotGayNoticeRequired,
} from 'calypso/lib/domains';
import { shouldUseMultipleDomainsInCart } from 'calypso/signup/steps/domains/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { getCurrentFlowName } from 'calypso/state/signup/flow/selectors';
import PremiumBadge from './premium-badge';

class DomainRegistrationSuggestion extends Component {
	static propTypes = {
		isDomainOnly: PropTypes.bool,
		isCartPendingUpdate: PropTypes.bool,
		isCartPendingUpdateDomain: PropTypes.object,
		isSignupStep: PropTypes.bool,
		showStrikedOutPrice: PropTypes.bool,
		isFeatured: PropTypes.bool,
		buttonStyles: PropTypes.object,
		cart: PropTypes.object,
		suggestion: PropTypes.shape( {
			domain_name: PropTypes.string.isRequired,
			product_slug: PropTypes.string,
			cost: PropTypes.string,
			match_reasons: PropTypes.arrayOf( PropTypes.oneOf( VALID_MATCH_REASONS ) ),
			currency_code: PropTypes.string,
		} ).isRequired,
		suggestionSelected: PropTypes.bool,
		onButtonClick: PropTypes.func.isRequired,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		premiumDomain: PropTypes.object,
		selectedSite: PropTypes.object,
		railcarId: PropTypes.string,
		recordTracksEvent: PropTypes.func,
		uiPosition: PropTypes.number,
		fetchAlgo: PropTypes.string,
		query: PropTypes.string,
		pendingCheckSuggestion: PropTypes.object,
		unavailableDomains: PropTypes.array,
		productCost: PropTypes.string,
		renewCost: PropTypes.string,
		productSaleCost: PropTypes.string,
		hideMatchReasons: PropTypes.bool,
		domainAndPlanUpsellFlow: PropTypes.bool,
		products: PropTypes.object,
	};

	componentDidMount() {
		this.recordRender();
	}

	componentDidUpdate( prevProps ) {
		if (
			prevProps.railcarId !== this.props.railcarId ||
			prevProps.uiPosition !== this.props.uiPosition
		) {
			this.recordRender();
		}
	}

	recordRender() {
		if ( this.props.railcarId && typeof this.props.uiPosition === 'number' ) {
			let resultSuffix = '';
			if ( this.props.suggestion.isRecommended ) {
				resultSuffix = '#recommended';
			} else if ( this.props.suggestion.isBestAlternative ) {
				resultSuffix = '#best-alternative';
			}

			this.props.recordTracksEvent( 'calypso_traintracks_render', {
				railcar: this.props.railcarId,
				ui_position: this.props.uiPosition,
				fetch_algo: `${ this.props.fetchAlgo }/${ this.props.suggestion.vendor }`,
				root_vendor: this.props.suggestion.vendor,
				rec_result: `${ this.props.suggestion.domain_name }${ resultSuffix }`,
				fetch_query: this.props.query,
				domain_type: this.props.suggestion.is_premium ? 'premium' : 'standard',
				tld: getTld( this.props.suggestion.domain_name ),
				flow_name: this.props.flowName,
			} );
		}
	}

	onButtonClick = ( previousState ) => {
		const { suggestion, railcarId, uiPosition } = this.props;

		if ( this.isUnavailableDomain( suggestion.domain_name ) ) {
			return;
		}

		if ( railcarId ) {
			this.props.recordTracksEvent( 'calypso_traintracks_interact', {
				railcar: railcarId,
				action: 'domain_added_to_cart',
				domain: suggestion.domain_name,
				root_vendor: suggestion.vendor,
			} );
		}

		this.props.onButtonClick( suggestion, uiPosition, previousState );
	};

	isUnavailableDomain = ( domain ) => {
		return includes( this.props.unavailableDomains, domain );
	};

	getButtonProps() {
		const {
			cart,
			domainsWithPlansOnly,
			isSignupStep,
			selectedSite,
			suggestion,
			suggestionSelected,
			translate,
			pendingCheckSuggestion,
			premiumDomain,
			isCartPendingUpdateDomain,
			flowName,
			temporaryCart,
			domainRemovalQueue,
		} = this.props;
		const { domain_name: domain } = suggestion;

		let isAdded =
			suggestionSelected ||
			hasDomainInCart( cart, domain ) ||
			( temporaryCart && temporaryCart.some( ( item ) => item.meta === domain ) );

		// If we're removing this domain, let's instantly show that for the user
		if (
			domainRemovalQueue?.length > 0 &&
			domainRemovalQueue.some( ( item ) => item.meta === domain ) &&
			! ( temporaryCart && temporaryCart.some( ( item ) => item.meta === domain ) )
		) {
			isAdded = false;
		}

		let buttonContent;
		let buttonStyles = this.props.buttonStyles;

		if ( isAdded ) {
			buttonContent = translate( '{{checkmark/}} In Cart', {
				context: 'Domain is already added to shopping cart',
				components: { checkmark: <Gridicon icon="checkmark" /> },
			} );

			buttonStyles = { ...buttonStyles, primary: false };

			if ( shouldUseMultipleDomainsInCart( flowName ) ) {
				buttonStyles = { ...buttonStyles, borderless: true };

				buttonContent = translate( '{{checkmark/}} Selected', {
					context: 'Domain is already added to shopping cart',
					components: { checkmark: <Gridicon style={ { height: 21 } } icon="checkmark" /> },
				} );
			}
		} else {
			buttonContent =
				! isSignupStep &&
				shouldBundleDomainWithPlan( domainsWithPlansOnly, selectedSite, cart, suggestion )
					? translate( 'Upgrade', {
							context: 'Domain mapping suggestion button with plan upgrade',
					  } )
					: translate( 'Select', { context: 'Domain mapping suggestion button' } );
		}

		if ( premiumDomain?.pending ) {
			buttonStyles = { ...buttonStyles, disabled: true };
		} else if ( premiumDomain?.is_price_limit_exceeded ) {
			buttonStyles = { ...buttonStyles, disabled: true };
			buttonContent = translate( 'Restricted', {
				context: 'Premium domain is not available for registration',
			} );
		} else if ( this.isUnavailableDomain( suggestion.domain_name ) ) {
			buttonStyles = { ...buttonStyles, disabled: true };
			buttonContent = translate( 'Unavailable', {
				context: 'Domain suggestion is not available for registration',
			} );
		} else if (
			pendingCheckSuggestion?.domain_name === domain ||
			( this.props.isCartPendingUpdate && isCartPendingUpdateDomain?.domain_name === domain )
		) {
			buttonStyles = { ...buttonStyles, busy: true, disabled: true };
		} else if (
			pendingCheckSuggestion ||
			( this.props.isCartPendingUpdate && isCartPendingUpdateDomain?.domain_name !== domain )
		) {
			buttonStyles = { ...buttonStyles, disabled: true };
		}

		if ( shouldUseMultipleDomainsInCart( flowName ) ) {
			buttonStyles = { ...buttonStyles, primary: false, busy: false, disabled: false };
		}

		return {
			buttonContent,
			buttonStyles,
			isAdded,
		};
	}

	getPriceRule() {
		const {
			cart,
			isDomainOnly,
			domainsWithPlansOnly,
			selectedSite,
			suggestion,
			flowName,
			domainAndPlanUpsellFlow,
		} = this.props;
		return getDomainPriceRule(
			domainsWithPlansOnly,
			selectedSite,
			cart,
			suggestion,
			isDomainOnly,
			flowName,
			domainAndPlanUpsellFlow
		);
	}

	/**
	 * Splits a domain into name and tld. Everything after the "first dot"
	 * becomes the tld. This is not very comprehensive since there can be
	 * subdomains which would fail this test. However, for our purpose of
	 * highlighting the TLD in domain suggestions, this is good enough.
	 * @param {string} domain The domain to be parsed
	 */
	getDomainParts( domain ) {
		const parts = domain.split( '.' );
		const name = parts[ 0 ];
		const tld = `.${ parts.slice( 1 ).join( '.' ) }`;
		return {
			name,
			tld,
		};
	}

	getFormattedDomainName( name ) {
		if ( name.length <= 24 ) {
			return name;
		}

		return (
			<abbr title={ name }>
				{ name.slice( 0, 8 ) }…{ name.slice( -8 ) }
			</abbr>
		);
	}

	renderDomain( hasBadges = false ) {
		const {
			showHstsNotice,
			showDotGayNotice,
			suggestion: { domain_name: domain },
		} = this.props;

		const { name, tld } = this.getDomainParts( domain );

		const wrapperClassName = clsx( 'domain-registration-suggestion__title-info', {
			'has-badges': hasBadges,
		} );
		const titleWrapperClassName = clsx( 'domain-registration-suggestion__title-wrapper', {
			'domain-registration-suggestion__title-domain':
				this.props.showStrikedOutPrice && ! this.props.isFeatured,
			'domain-registration-suggestion__larger-domain': name.length > 15 ? true : false,
		} );

		return (
			<div className={ wrapperClassName }>
				<div className={ titleWrapperClassName }>
					<h3 className="domain-registration-suggestion__title">
						<div className="domain-registration-suggestion__domain-title">
							<span aria-label={ domain }>
								<span className="domain-registration-suggestion__domain-title-name">
									{ this.getFormattedDomainName( name ) }
								</span>
								<span className="domain-registration-suggestion__domain-title-tld">{ tld }</span>
							</span>
							{ ( showHstsNotice || showDotGayNotice ) && this.renderInfoBubble() }
						</div>
					</h3>
				</div>
			</div>
		);
	}

	getHstsMessage() {
		const {
			translate,
			suggestion: { domain_name: domain },
		} = this.props;

		return translate(
			'All domains ending in {{strong}}%(tld)s{{/strong}} require an SSL certificate ' +
				'to host a website. When you host this domain at WordPress.com an SSL ' +
				'certificate is included. {{a}}Learn more{{/a}}.',
			{
				args: {
					tld: '.' + getTld( domain ),
				},
				components: {
					a: (
						<a
							href={ localizeUrl( HTTPS_SSL ) }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ ( event ) => {
								event.stopPropagation();
							} }
						/>
					),
					strong: <strong />,
				},
			}
		);
	}

	getDotGayMessage() {
		const { translate } = this.props;

		return translate(
			'Any anti-LGBTQ content is prohibited and can result in registration termination. The registry will donate 20% of all registration revenue to LGBTQ non-profit organizations.'
		);
	}

	renderInfoBubble() {
		const { isFeatured, showHstsNotice, showDotGayNotice } = this.props;

		const infoPopoverSize = isFeatured ? 22 : 18;
		return (
			<InfoPopover
				className="domain-registration-suggestion__hsts-tooltip"
				iconSize={ infoPopoverSize }
				position="right"
				showOnHover
			>
				{ ( showHstsNotice && this.getHstsMessage() ) ||
					( showDotGayNotice && this.getDotGayMessage() ) }
			</InfoPopover>
		);
	}

	renderBadges() {
		const {
			suggestion: { isRecommended, isBestAlternative, is_premium: isPremium },
			translate,
			isFeatured,
			productSaleCost,
			premiumDomain,
		} = this.props;
		const badges = [];

		if ( isRecommended && isFeatured ) {
			badges.push(
				<Badge key="recommended" type="info-green">
					{ translate( 'Recommended' ) }
				</Badge>
			);
		} else if ( isBestAlternative && isFeatured ) {
			badges.push(
				<Badge key="best-alternative" type="info-purple">
					{ translate( 'Best Alternative' ) }
				</Badge>
			);
		}

		const paidDomain = isPaidDomain( this.getPriceRule() );
		if ( productSaleCost && paidDomain ) {
			const saleBadgeText = translate( 'Sale', {
				comment: 'Shown next to a domain that has a special discounted sale price',
			} );
			badges.push( <Badge key="sale">{ saleBadgeText }</Badge> );
		}

		if ( isPremium ) {
			badges.push(
				<PremiumBadge key="premium" restrictedPremium={ premiumDomain?.is_price_limit_exceeded } />
			);
		}

		if ( badges.length > 0 ) {
			return <div className="domain-registration-suggestion__badges">{ badges }</div>;
		}
	}

	renderMatchReason() {
		const {
			suggestion: { domain_name: domain },
		} = this.props;

		if ( ! Array.isArray( this.props.suggestion.match_reasons ) ) {
			return <div className="domain-registration-suggestion__match-reasons"></div>;
		}

		const matchReasons = parseMatchReasons( domain, this.props.suggestion.match_reasons );

		return (
			<div className="domain-registration-suggestion__match-reasons">
				{ matchReasons.map( ( phrase, index ) => (
					<div className="domain-registration-suggestion__match-reason" key={ index }>
						<Gridicon icon="checkmark" size={ 18 } />
						{ phrase }
					</div>
				) ) }
			</div>
		);
	}

	render() {
		const {
			domainsWithPlansOnly,
			isFeatured,
			suggestion: { domain_name: domain },
			productCost,
			renewCost,
			productSaleCost,
			premiumDomain,
			showStrikedOutPrice,
			hideMatchReasons,
		} = this.props;

		const isUnavailableDomain = this.isUnavailableDomain( domain );

		const extraClasses = clsx( {
			'featured-domain-suggestion': isFeatured,
			'is-unavailable': isUnavailableDomain,
		} );

		const badges = this.renderBadges();

		return (
			<DomainSuggestion
				extraClasses={ extraClasses }
				premiumDomain={ premiumDomain }
				priceRule={ this.getPriceRule() }
				price={ productCost }
				renewPrice={ renewCost }
				salePrice={ productSaleCost }
				domain={ domain }
				domainsWithPlansOnly={ domainsWithPlansOnly }
				onButtonClick={ this.onButtonClick }
				{ ...this.getButtonProps() }
				isFeatured={ isFeatured }
				showStrikedOutPrice={ showStrikedOutPrice }
				hideMatchReasons={ hideMatchReasons }
			>
				{ badges }
				{ this.renderDomain( !! badges ) }
				{ ! hideMatchReasons && isFeatured && this.renderMatchReason() }
			</DomainSuggestion>
		);
	}
}

const mapStateToProps = ( state, props ) => {
	const productSlug = get( props, 'suggestion.product_slug' );
	const productsList = props.products ?? getProductsList( state );
	const currentUserCurrencyCode =
		props.suggestion.currency_code || getCurrentUserCurrencyCode( state );
	const stripZeros = props.showStrikedOutPrice ? true : false;
	const isPremium = props.premiumDomain?.is_premium || props.suggestion?.is_premium;
	const flowName = getCurrentFlowName( state );

	let productCost;
	let productSaleCost;
	let renewCost;

	if ( isPremium ) {
		productCost = props.premiumDomain?.cost;
		renewCost = props.premiumDomain?.renew_cost;
		if ( props.premiumDomain?.sale_cost ) {
			productSaleCost = formatCurrency( props.premiumDomain?.sale_cost, currentUserCurrencyCode, {
				stripZeros,
			} );
		}
	} else if ( HUNDRED_YEAR_DOMAIN_FLOW === flowName ) {
		productCost = props.suggestion.cost;
		renewCost = props.suggestion.renew_cost;
	} else {
		productCost = getDomainPrice( productSlug, productsList, currentUserCurrencyCode, stripZeros );
		// Renew cost is the same as the product cost for non-premium domains
		renewCost = productCost;
		productSaleCost = getDomainSalePrice(
			productSlug,
			productsList,
			currentUserCurrencyCode,
			stripZeros
		);
	}

	return {
		showHstsNotice: isHstsRequired( productSlug, productsList ),
		showDotGayNotice: isDotGayNoticeRequired( productSlug, productsList ),
		productCost,
		renewCost,
		productSaleCost,
		flowName,
		currentUser: getCurrentUser( state ),
	};
};

export default connect( mapStateToProps, { recordTracksEvent } )(
	localize( DomainRegistrationSuggestion )
);
