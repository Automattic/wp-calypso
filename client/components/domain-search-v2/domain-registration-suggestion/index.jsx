import {
	DomainSuggestion,
	DomainSuggestionBadge,
	DomainSuggestionPrice,
	DomainSuggestionPrimaryCTA,
	getTld,
	parseMatchReasons,
} from '@automattic/domain-search';
import { localizeUrl } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { HUNDRED_YEAR_DOMAIN_FLOW, isHundredYearPlanFlow } from '@automattic/onboarding';
import { HTTPS_SSL } from '@automattic/urls';
import { envelope } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import { get, includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import {
	getDomainPriceRule,
	isPaidDomain,
	DOMAIN_PRICE_RULE,
} from 'calypso/lib/cart-values/cart-items';
import { getDomainPrice, getDomainSalePrice } from 'calypso/lib/domains';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { getCurrentFlowName } from 'calypso/state/signup/flow/selectors';
import { DomainSuggestionCTA } from '../__legacy/domain-suggestion-cta';
import DomainProductPrice from '../domain-product-price';
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
			match_reasons: PropTypes.arrayOf( PropTypes.string ),
			currency_code: PropTypes.string,
			policy_notices: PropTypes.arrayOf(
				PropTypes.shape( {
					type: PropTypes.string.isRequired,
					label: PropTypes.string.isRequired,
					message: PropTypes.string.isRequired,
				} )
			),
		} ).isRequired,
		suggestionSelected: PropTypes.bool,
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

	onButtonClick = () => {
		const { suggestion, railcarId } = this.props;

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
	};

	isUnavailableDomain = ( domain ) => {
		return includes( this.props.unavailableDomains, domain );
	};

	getSelectDomainAriaLabel() {
		const { suggestion, translate, productCost, productSaleCost } = this.props;
		const priceRule = this.getPriceRule();

		const baseLabel = translate( 'Select domain %(domainName)s', {
			args: { domainName: suggestion.domain_name },
			context: 'Accessible label for domain selection button. %(domainName)s is the domain name.',
		} );

		switch ( priceRule ) {
			case DOMAIN_PRICE_RULE.ONE_TIME_PRICE:
				return translate( '%(baseLabel)s. %(price)s one-time', {
					args: {
						baseLabel,
						price: productCost,
					},
					comment:
						'Accessible label for one-time priced domain (e.g. domain with 100-year plan). %(baseLabel)s is the base label (e.g. "Select domain testing.com"). %(price)s is the price.',
				} );
			case DOMAIN_PRICE_RULE.FREE_DOMAIN:
				return translate( '%(baseLabel)s. Free', {
					args: {
						baseLabel,
					},
					comment:
						'Accessible label for free domain. %(baseLabel)s is the base label (e.g. "Select domain testing.com").',
				} );
			case DOMAIN_PRICE_RULE.FREE_FOR_FIRST_YEAR:
				return translate( '%(baseLabel)s. Free for the first year, then %(price)s per year', {
					args: {
						baseLabel,
						price: productCost,
					},
					comment:
						'Accessible label for domain free for the first year. %(baseLabel)s is the base label (e.g. "Select domain testing.com"). %(price)s is the price.',
				} );
			case DOMAIN_PRICE_RULE.FREE_WITH_PLAN:
				return translate(
					'%(baseLabel)s. Free for the first year with annual paid plans, then %(price)s per year',
					{
						args: {
							baseLabel,
							price: productCost,
						},
						comment:
							'Accessible label for free domain with normal price. %(baseLabel)s is the base label (e.g. "Select domain testing.com"). %(price)s is the price.',
					}
				);
			case DOMAIN_PRICE_RULE.UPGRADE_TO_HIGHER_PLAN_TO_BUY:
				return translate( '%(baseLabel)s. Plan upgrade required to register this domain.', {
					args: {
						baseLabel,
					},
					comment:
						'Accessible label for domain that requires a plan upgrade. %(baseLabel)s is the base label (e.g. "Select domain testing.com").',
				} );
			case DOMAIN_PRICE_RULE.INCLUDED_IN_HIGHER_PLAN:
				return translate( '%(baseLabel)s. Included in paid plans', {
					args: {
						baseLabel,
					},
					comment:
						'Accessible label for domain included in higher plans. %(baseLabel)s is the base label (e.g. "Select domain testing.com").',
				} );
			case DOMAIN_PRICE_RULE.DOMAIN_MOVE_PRICE:
				return translate( '%(baseLabel)s. %(price)s one-time', {
					args: {
						baseLabel,
						price: productCost,
					},
					comment:
						'Accessible label for domain move price. %(baseLabel)s is the base label (e.g. "Select domain testing.com"). %(price)s is the price.',
				} );
			case DOMAIN_PRICE_RULE.PRICE:
				if ( productSaleCost && productCost ) {
					return translate(
						'%(baseLabel)s. %(salePrice)s for the first year, then %(price)s per year',
						{
							args: {
								baseLabel,
								salePrice: productSaleCost,
								price: productCost,
							},
							comment:
								'Accessible label for domain with sale price. %(baseLabel)s is the base label (e.g. "Select domain testing.com"). %(salePrice)s is the sale price. %(price)s is the price.',
						}
					);
				}
				if ( productCost ) {
					return translate( '%(baseLabel)s. %(price)s per year', {
						args: {
							baseLabel,
							price: productCost,
						},
						comment:
							'Accessible label for regularly priced domain. %(baseLabel)s is the base label (e.g. "Select domain testing.com"). %(price)s is the price.',
					} );
				}
				return baseLabel;
			default:
				return baseLabel;
		}
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

	getPolicyNoticeMessage( notice ) {
		const { translate } = this.props;

		if ( notice.type === 'hsts' ) {
			return translate(
				'%(message)s When you host this domain at WordPress.com, an SSL ' +
					'certificate is included. {{a}}Learn more{{/a}}.',
				{
					args: {
						message: notice.message,
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
					},
				}
			);
		}

		return notice.message;
	}

	isExactMatch = () => {
		const { query, suggestion } = this.props;
		return query === suggestion.domain_name;
	};

	renderBadges() {
		const {
			suggestion: {
				isRecommended,
				isBestAlternative,
				is_premium: isPremium,
				policy_notices: policyNotices,
			},
			translate,
			isFeatured,
			productSaleCost,
			premiumDomain,
			flowName,
		} = this.props;
		const badges = [];

		if ( isFeatured && this.isExactMatch() ) {
			badges.push(
				<DomainSuggestionBadge variation="success">
					{ translate( "It's available!" ) }
				</DomainSuggestionBadge>
			);
		} else if ( isRecommended && isFeatured ) {
			badges.push(
				<DomainSuggestionBadge key="recommended">
					{ translate( 'Recommended' ) }
				</DomainSuggestionBadge>
			);
		} else if ( isBestAlternative && isFeatured ) {
			badges.push(
				<DomainSuggestionBadge key="best-alternative">
					{ translate( 'Best alternative' ) }
				</DomainSuggestionBadge>
			);
		}

		if ( policyNotices ) {
			policyNotices.forEach( ( notice ) => {
				badges.push(
					<DomainSuggestionBadge
						key={ notice.type }
						popover={ this.getPolicyNoticeMessage( notice ) }
					>
						{ notice.label }
					</DomainSuggestionBadge>
				);
			} );
		}

		const skipSaleBadge = isHundredYearPlanFlow( flowName );

		const paidDomain = isPaidDomain( this.getPriceRule() );
		if ( productSaleCost && paidDomain && ! skipSaleBadge ) {
			const saleBadgeText = translate( 'Sale', {
				comment: 'Shown next to a domain that has a special discounted sale price',
			} );
			badges.push(
				<DomainSuggestionBadge key="sale" variation="warning">
					{ saleBadgeText }
				</DomainSuggestionBadge>
			);
		}

		if ( isPremium ) {
			badges.push(
				<PremiumBadge
					key="premium"
					restrictedPremium={ premiumDomain?.is_price_limit_exceeded }
					domainName={ this.props.suggestion.domain_name }
				/>
			);
		}

		if ( badges.length === 0 ) {
			return null;
		}

		return badges;
	}

	renderMatchReasons() {
		const {
			suggestion: { domain_name: domain },
			hideMatchReasons,
			isFeatured,
		} = this.props;

		if (
			! Array.isArray( this.props.suggestion.match_reasons ) ||
			hideMatchReasons ||
			! isFeatured ||
			! this.isExactMatch()
		) {
			return null;
		}

		return parseMatchReasons( domain, this.props.suggestion.match_reasons );
	}

	render() {
		const {
			suggestion: { domain_name: fullDomain },
			productCost,
			renewCost,
			productSaleCost,
			zeroCost,
			flowName,
			premiumDomain,
			translate,
			isFeatured,
		} = this.props;

		const [ domainName, ...tld ] = fullDomain.split( '.' );

		const badges = this.renderBadges();

		const SuggestionComponent = isFeatured ? DomainSuggestion.Featured : DomainSuggestion;

		const matchReasons = this.renderMatchReasons();

		const priceRule = this.getPriceRule();

		let cta = null;
		let price = null;

		if ( premiumDomain?.is_price_limit_exceeded ) {
			cta = (
				<DomainSuggestionPrimaryCTA
					href="https://wordpress.com/help/contact"
					label={ translate( 'Interested in this domain? Contact support' ) }
					icon={ envelope }
				>
					{ translate( 'Contact support' ) }
				</DomainSuggestionPrimaryCTA>
			);

			price = (
				<DomainSuggestionPrice
					salePrice={ productSaleCost }
					price={ productCost }
					renewPrice={ renewCost }
				/>
			);
		} else {
			price = ! isHundredYearPlanFlow( flowName ) && (
				<DomainProductPrice
					zeroCost={ zeroCost }
					rule={ priceRule }
					salePrice={ productSaleCost }
					price={ productCost }
					renewPrice={ renewCost }
				/>
			);
			cta = <DomainSuggestionCTA uuid={ fullDomain } onClick={ this.onButtonClick } />;
		}

		return (
			<SuggestionComponent
				isSingleFeaturedSuggestion={ this.props.isSingleFeaturedSuggestion }
				badges={ badges }
				domain={ domainName }
				isHighlighted={ isFeatured && this.isExactMatch() }
				matchReasons={ matchReasons }
				tld={ tld.join( '.' ) }
				price={ price }
				cta={ cta }
			/>
		);
	}
}

const mapStateToProps = ( state, props ) => {
	const productSlug = get( props, 'suggestion.product_slug' );
	const productsList = props.products ?? getProductsList( state );
	const currentUserCurrencyCode =
		props.suggestion.currency_code || getCurrentUserCurrencyCode( state );
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
				stripZeros: true,
			} );
		}
	} else if ( HUNDRED_YEAR_DOMAIN_FLOW === flowName ) {
		productCost = props.suggestion.cost;
		renewCost = props.suggestion.renew_cost;
	} else {
		productCost = getDomainPrice( productSlug, productsList, currentUserCurrencyCode, true );
		// Renew cost is the same as the product cost for non-premium domains
		renewCost = productCost;
		productSaleCost = getDomainSalePrice(
			productSlug,
			productsList,
			currentUserCurrencyCode,
			true
		);
	}

	return {
		zeroCost: formatCurrency( 0, currentUserCurrencyCode, { stripZeros: true } ),
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
