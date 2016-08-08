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
import PlanFeaturesActions from './actions';
import { isCurrentPlanPaid, isCurrentSitePlan } from 'state/sites/selectors';
import { getPlansBySiteId } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getPlanDiscountPrice } from 'state/sites/plans/selectors';
import {
	getPlanRawPrice,
	getPlan,
	getPlanSlug
} from 'state/plans/selectors';
import {
	isPopular,
	isMonthly,
	getPlanFeaturesObject,
	getPlanClass
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

class PlanFeatures extends Component {

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
			</div>
		);
	}

	renderMobileView() {
		const { isPlaceholder, translate, planProperties, isInSignup } = this.props;

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
				rawPrice
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
			return (
				<PlanFeaturesItem key={ index } description={
					currentFeature.getDescription
						? currentFeature.getDescription()
						: null
				}>
					{ currentFeature.getTitle() }
				</PlanFeaturesItem>
			);
		} );
	}

	renderPlanHeaders() {
		const { planProperties, isPlaceholder } = this.props;

		return map( planProperties, ( properties ) => {
			const {
				currencyCode,
				current,
				discountPrice,
				planConstantObj,
				planName,
				popular,
				rawPrice
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
						<PlanFeaturesItem description={
											currentFeature.getDescription
												? currentFeature.getDescription()
												: null
										}>
							{ currentFeature.getTitle() }
						</PlanFeaturesItem>
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
}

PlanFeatures.propTypes = {
	onUpgradeClick: PropTypes.func,
	// either you specify the plans prop or isPlaceholder prop
	plans: PropTypes.array,
	planProperties: PropTypes.array,
	isPlaceholder: PropTypes.bool,
	isInSignup: PropTypes.bool,
	selectedFeature: PropTypes.string
};

PlanFeatures.defaultProps = {
	onUpgradeClick: noop,
	isInSignup: false
};

export default connect( ( state, ownProps ) => {
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

		if ( placeholder || ! planObject || isLoadingSitePlans ) {
			isPlaceholder = true;
		}

		return {
			available: available,
			currencyCode: getCurrentUserCurrencyCode( state ),
			current: isCurrentSitePlan( state, selectedSiteId, planProductId ),
			discountPrice: getPlanDiscountPrice( state, selectedSiteId, plan, showMonthly ),
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
			rawPrice: getPlanRawPrice( state, planProductId, showMonthly )
		};
	} );

	return {
		isPlaceholder,
		planProperties: planProperties
	};
} )( localize( PlanFeatures ) );
