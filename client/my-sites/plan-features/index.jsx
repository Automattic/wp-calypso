/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { map, reduce, noop } from 'lodash';
import page from 'page';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PlanFeaturesHeader from './header';
import PlanFeaturesItem from './item';
import Popover from 'components/popover';
import PlanFeaturesActions from './actions';
import { isCurrentPlanPaid, isCurrentSitePlan } from 'state/sites/selectors';
import { getPlansBySiteId } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getPlanDiscountedRawPrice } from 'state/sites/plans/selectors';
import {
	getPlanRawPrice,
	getPlan,
	getPlanSlug,
	getPlanBySlug
} from 'state/plans/selectors';
import {
	isPopular,
	isMonthly,
	getPlanFeaturesObject,
	getPlanClass,
	getMonthlyPlanByYearly
} from 'lib/plans/constants';
import { isFreePlan } from 'lib/plans';
import { getSiteSlug } from 'state/sites/selectors';
import {
	getPlanPath,
	canUpgradeToPlan,
	applyTestFiltersToPlansList
} from 'lib/plans';
import { planItem as getCartItemForPlan } from 'lib/cart-values/cart-items';
import SpinnerLine from 'components/spinner-line';
import FoldableCard from 'components/foldable-card';
import { recordTracksEvent } from 'state/analytics/actions';

class PlanFeatures extends Component {

	static getFeaturePopoverHiddenState() {
		return {
			showPopover: false,
			popoverReference: null,
			popoverDescription: ''
		};
	}

	constructor() {
		super();

		this.state = PlanFeatures.getFeaturePopoverHiddenState();

		this.closeFeaturePopover = this.closeFeaturePopover.bind( this );
		this.showFeaturePopover = this.showFeaturePopover.bind( this );
		this.swapFeaturePopover = this.swapFeaturePopover.bind( this );
	}

	render() {
		const { planProperties } = this.props;

		const tableClasses = classNames( 'plan-features__table',
			`has-${ planProperties.length }-cols` );

		return (
			<div className="plan-features">
				<div className="plan-features__mobile">
					{ this.renderMobileView() }
				</div>
				<table className={ tableClasses }>
					<tbody>
						<tr>
							{ this.renderPlanHeaders() }
						</tr>
						<tr>
							{ this.renderPlanDescriptions() }
						</tr>
						<tr>
							{ this.renderTopButtons() }
						</tr>
							{ this.renderPlanFeatureRows() }
						<tr>
							{ this.renderBottomButtons() }
						</tr>
					</tbody>
				</table>

				{ this.renderFeaturePopover() }
			</div>
		);
	}

	renderMobileView() {
		const { isPlaceholder, translate, planProperties, isInSignup, intervalType, site, isInJetpackConnect } = this.props;

		// move any free plan to last place in mobile view
		let freePlanProperties;
		const reorderedPlans = planProperties.filter( ( properties ) => {
			if ( isFreePlan( properties.planName ) ) {
				freePlanProperties = properties;
				return false;
			}
			return true;
		} );

		if ( freePlanProperties ) {
			reorderedPlans.push( freePlanProperties );
		}

		return map( reorderedPlans, ( properties ) => {
			const {
				available,
				currencyCode,
				current,
				features,
				discountPrice,
				onUpgradeClick,
				planConstantObj,
				planName,
				popular,
				rawPrice,
				relatedMonthlyPlan
			} = properties;

			return (
				<div className="plan-features__mobile-plan" key={ planName }>
					<PlanFeaturesHeader
						current={ current }
						currencyCode={ currencyCode }
						popular={ popular }
						title={ planConstantObj.getTitle() }
						planType={ planName }
						rawPrice={ rawPrice }
						discountPrice={ discountPrice }
						billingTimeFrame={ planConstantObj.getBillingTimeFrame() }
						isPlaceholder={ isPlaceholder }
						intervalType={ intervalType }
						site={ site }
						isInJetpackConnect={ isInJetpackConnect }
						relatedMonthlyPlan={ relatedMonthlyPlan }
					/>
					<p className="plan-features__description">
						{ planConstantObj.getDescription() }
					</p>
					<PlanFeaturesActions
						className={ getPlanClass( planName ) }
						current={ current }
						popular={ popular }
						available = { available }
						onUpgradeClick={ onUpgradeClick }
						freePlan={ isFreePlan( planName ) }
						isPlaceholder={ isPlaceholder }
						isInSignup={ isInSignup }
					/>
					<FoldableCard
						header={ translate( 'Show features' ) }
						clickableHeader
						compact>
						{ this.renderMobileFeatures( features ) }
					</FoldableCard>
				</div>
			);
		} );
	}

	renderMobileFeatures( features ) {
		return map( features, ( currentFeature, index ) => {
			return this.renderFeatureItem( currentFeature, index );
		} );
	}

	renderPlanHeaders() {
		const { planProperties, isPlaceholder, intervalType, site, isInJetpackConnect } = this.props;

		return map( planProperties, ( properties ) => {
			const {
				currencyCode,
				current,
				discountPrice,
				planConstantObj,
				planName,
				popular,
				rawPrice,
				relatedMonthlyPlan
			} = properties;
			const classes = classNames( 'plan-features__table-item', 'has-border-top' );
			return (
				<td key={ planName } className={ classes }>
					<PlanFeaturesHeader
						current={ current }
						currencyCode={ currencyCode }
						popular={ popular }
						title={ planConstantObj.getTitle() }
						planType={ planName }
						rawPrice={ rawPrice }
						discountPrice={ discountPrice }
						billingTimeFrame={ planConstantObj.getBillingTimeFrame() }
						isPlaceholder={ isPlaceholder }
						intervalType={ intervalType }
						site={ site }
						isInJetpackConnect={ isInJetpackConnect }
						relatedMonthlyPlan={ relatedMonthlyPlan }
					/>
				</td>
			);
		} );
	}

	renderPlanDescriptions() {
		const { planProperties, isPlaceholder } = this.props;

		return map( planProperties, ( properties ) => {
			const {
				planName,
				planConstantObj
			} = properties;

			const classes = classNames( 'plan-features__table-item', {
				'is-placeholder': isPlaceholder
			} );

			return (
				<td key={ planName } className={ classes }>
					{
						isPlaceholder
							? <SpinnerLine />
							: null
					}

					<p className="plan-features__description">
						{ planConstantObj.getDescription() }
					</p>
				</td>
			);
		} );
	}

	renderTopButtons() {
		const { planProperties, isPlaceholder, isInSignup } = this.props;

		return map( planProperties, ( properties ) => {
			const {
				available,
				current,
				onUpgradeClick,
				planName,
				popular
			} = properties;

			const classes = classNames(
				'plan-features__table-item',
				'has-border-bottom',
				'is-top-buttons'
			);

			return (
				<td key={ planName } className={ classes }>
					<PlanFeaturesActions
						className={ getPlanClass( planName ) }
						current={ current }
						available = { available }
						popular={ popular }
						onUpgradeClick={ onUpgradeClick }
						freePlan={ isFreePlan( planName ) }
						isPlaceholder={ isPlaceholder }
						isInSignup={ isInSignup }
					/>
				</td>
			);
		} );
	}

	getLongestFeaturesList() {
		const { planProperties } = this.props;

		return reduce( planProperties, ( longest, properties ) => {
			const currentFeatures = Object.keys( properties.features );
			return currentFeatures.length > longest.length
				? currentFeatures
				: longest;
		}, [] );
	}

	renderPlanFeatureRows() {
		const longestFeatures = this.getLongestFeaturesList();
		return map( longestFeatures, ( featureKey, rowIndex ) => {
			return (
				<tr key={ rowIndex } className="plan-features__row">
					{ this.renderPlanFeatureColumns( rowIndex ) }
				</tr>
			);
		} );
	}

	renderFeaturePopover() {
		return (
			<Popover
				showDelay={ 100 }
				id="popover__plan-features"
				isVisible={ this.state.showPopover }
				context={ this.state.popoverReference }
				position="right"
				onClose={ this.closeFeaturePopover }
				className={ classNames(
						'info-popover__tooltip',
						'popover__plan-features'
					) }
				>
					{ this.state.popoverDescription }
			</Popover>
		);
	}

	renderFeatureItem( feature, index ) {
		return (
			<PlanFeaturesItem
				key={ index }
				description={ feature.getDescription
					? feature.getDescription()
					: null
				}
				onMouseEnter={ this.showFeaturePopover }
				onMouseLeave={ this.closeFeaturePopover }
				onTouchStart={ this.swapFeaturePopover }
			>
				{ feature.getTitle() }
			</PlanFeaturesItem>
		);
	}

	showFeaturePopover( el, popoverDescription ) {
		this.setState( {
			showPopover: true,
			popoverDescription,
			popoverReference: el
		} );
	}

	closeFeaturePopover() {
		this.setState( PlanFeatures.getFeaturePopoverHiddenState() );
	}

	swapFeaturePopover( el, popoverDescription ) {
		if ( this.state.showPopover ) {
			this.closeFeaturePopover();
		} else {
			this.showFeaturePopover( el, popoverDescription );
		}
	}

	renderPlanFeatureColumns( rowIndex ) {
		const {
			planProperties,
			selectedFeature
		} = this.props;

		return map( planProperties, ( properties ) => {
			const {
				features,
				planName
			} = properties;

			const featureKeys = Object.keys( features ),
				key = featureKeys[ rowIndex ],
				currentFeature = features[ key ];

			const classes = classNames( 'plan-features__table-item', getPlanClass( planName ), {
				'has-partial-border': rowIndex + 1 < featureKeys.length,
				'is-highlighted': selectedFeature && currentFeature &&
					selectedFeature === currentFeature.getSlug()
			} );

			return (
				currentFeature
					? <td key={ `${ planName }-${ key }` } className={ classes }>
						{ this.renderFeatureItem( currentFeature ) }
					</td>
					: <td key={ `${ planName }-none` } className="plan-features__table-item"></td>
			);
		} );
	}

	renderBottomButtons() {
		const { planProperties, isPlaceholder, isInSignup } = this.props;

		return map( planProperties, ( properties ) => {
			const {
				available,
				current,
				onUpgradeClick,
				planName,
				popular
			} = properties;
			const classes = classNames(
				'plan-features__table-item',
				'has-border-bottom',
				'is-bottom-buttons'
			);
			return (
				<td key={ planName } className={ classes }>
					<PlanFeaturesActions
						className={ getPlanClass( planName ) }
						current={ current }
						available = { available }
						popular={ popular }
						onUpgradeClick={ onUpgradeClick }
						freePlan={ isFreePlan( planName ) }
						isPlaceholder={ isPlaceholder }
						isInSignup={ isInSignup }
					/>
				</td>
			);
		} );
	}

	componentWillMount() {
		this.props.recordTracksEvent( 'calypso_wp_plans_test_view' );
	}
}

PlanFeatures.propTypes = {
	onUpgradeClick: PropTypes.func,
	// either you specify the plans prop or isPlaceholder prop
	plans: PropTypes.array,
	planProperties: PropTypes.array,
	isPlaceholder: PropTypes.bool,
	isInSignup: PropTypes.bool,
	isInJetpackConnect: PropTypes.bool,
	selectedFeature: PropTypes.string,
	intervalType: PropTypes.string,
	site: PropTypes.object
};

PlanFeatures.defaultProps = {
	onUpgradeClick: noop,
	isInSignup: false,
	isInJetpackConnect: false,
	intervalType: 'yearly',
	site: {}
};

export default connect(
	( state, ownProps ) => {
		const { isInSignup, placeholder, plans, onUpgradeClick } = ownProps;
		let isPlaceholder = placeholder;
		const planProperties = map( plans, ( plan ) => {
			const planConstantObj = applyTestFiltersToPlansList( plan );
			const planProductId = planConstantObj.getProductId();
			const selectedSiteId = isInSignup ? null : getSelectedSiteId( state );
			const planObject = getPlan( state, planProductId );
			const isPaid = isCurrentPlanPaid( state, selectedSiteId );
			const sitePlans = getPlansBySiteId( state, selectedSiteId );
			const isLoadingSitePlans = ! isInSignup && ! sitePlans.hasLoadedFromServer;
			const showMonthly = ! isMonthly( plan );
			const available = isInSignup ? true : canUpgradeToPlan( plan );
			const relatedMonthlyPlan = showMonthly ? getPlanBySlug( state, getMonthlyPlanByYearly( plan ) ) : null;

			if ( placeholder || ! planObject || isLoadingSitePlans ) {
				isPlaceholder = true;
			}

			return {
				available: available,
				currencyCode: getCurrentUserCurrencyCode( state ),
				current: isCurrentSitePlan( state, selectedSiteId, planProductId ),
				discountPrice: getPlanDiscountedRawPrice( state, selectedSiteId, plan, showMonthly ),
				features: getPlanFeaturesObject( planConstantObj.getFeatures() ),
				onUpgradeClick: onUpgradeClick
					? () => {
						const planSlug = getPlanSlug( state, planProductId );

						onUpgradeClick( getCartItemForPlan( planSlug ) );
					}
					: () => {
						if ( ! available ) {
							return;
						}

						const selectedSiteSlug = getSiteSlug( state, selectedSiteId );
						page( `/checkout/${ selectedSiteSlug }/${ getPlanPath( plan ) || '' }` );
					},
				planConstantObj,
				planName: plan,
				planObject: planObject,
				popular: isPopular( plan ) && ! isPaid,
				rawPrice: getPlanRawPrice( state, planProductId, ! relatedMonthlyPlan && showMonthly ),
				relatedMonthlyPlan: relatedMonthlyPlan
			};
		} );

		return {
			isPlaceholder,
			planProperties: planProperties
		};
	},
	{
		recordTracksEvent
	}
)( localize( PlanFeatures ) );

