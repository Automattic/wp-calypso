import { PLAN_BUSINESS_MONTHLY, PLAN_ECOMMERCE_MONTHLY } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PLAN_BUSINESS, PLAN_ECOMMERCE } from 'calypso/../packages/data-stores/src/plans/constants';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const noop = () => {};

const PlanFeaturesActionSuggestion = ( { planType, isInMarketplace, translate } ) => {
	if ( isInMarketplace ) {
		let suggestionText = '';
		switch ( planType ) {
			case PLAN_BUSINESS:
			case PLAN_BUSINESS_MONTHLY:
				suggestionText = translate(
					`Ideal if you are looking to power and flex your site's features with plugins`
				);
				break;
			case PLAN_ECOMMERCE:
			case PLAN_ECOMMERCE_MONTHLY:
				suggestionText = translate(
					`Essential for enabling and scaling your online store with countless plugins`
				);
				break;
			default:
				suggestionText = translate(
					`Ideal if you're just starting and don't need plugins and extra features`
				);
		}
		return <p className="plan-features__actions-suggestions"> { suggestionText }</p>;
	}
};

const PlanFeaturesActionsButton = ( {
	availableForPurchase = true,
	className,
	current = false,
	freePlan = false,
	isPlaceholder = false,
	isPopular,
	isInSignup,
	isLaunchPage,
	onUpgradeClick = noop,
	planName,
	planType,
	primaryUpgrade = false,
	translate,
	isInMarketplace,
} ) => {
	const classes = classNames(
		'plan-features__actions-button',
		{
			'is-current': current,
			'is-primary': ( primaryUpgrade && ! isPlaceholder ) || isPopular,
		},
		className
	);

	const handleUpgradeButtonClick = () => {
		if ( isPlaceholder ) {
			return;
		}

		recordTracksEvent( 'calypso_plan_features_upgrade_click', {
			current_plan: null,
			upgrading_to: planType,
		} );

		onUpgradeClick();
	};

	if ( isInMarketplace ) {
		if ( current ) {
			return (
				<Button className={ classes } disabled>
					{ translate( 'Current Plan', {
						args: {
							plan: planName,
						},
					} ) }
				</Button>
			);
		}
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ translate( 'Upgrade to %(plan)s', {
					args: {
						plan: planName,
					},
				} ) }
			</Button>
		);
	}

	if ( ( availableForPurchase || isPlaceholder ) && ! isLaunchPage && isInSignup ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ translate( 'Select', {
					args: {
						plan: planName,
					},
				} ) }
			</Button>
		);
	}

	if ( ( availableForPurchase || isPlaceholder ) && isLaunchPage && ! freePlan ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ translate( 'Select %(plan)s', {
					args: {
						plan: planName,
					},
					context: 'Button to select a paid plan by plan name, e.g., "Select Personal"',
					comment:
						'A button to select a new paid plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
				} ) }
			</Button>
		);
	}

	if ( ( availableForPurchase || isPlaceholder ) && isLaunchPage && freePlan ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ translate( 'Keep this plan', {
					comment:
						'A selection to keep the current plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
				} ) }
			</Button>
		);
	}

	return null;
};

const PlanFeaturesComparisonActions = ( props ) => {
	return (
		<div className="plan-features-comparison__actions">
			<div className="plan-features-comparison__actions-buttons">
				<PlanFeaturesActionsButton { ...props } />
			</div>
			<PlanFeaturesActionSuggestion { ...props } />
		</div>
	);
};

PlanFeaturesComparisonActions.propTypes = {
	availableForPurchase: PropTypes.bool,
	className: PropTypes.string,
	current: PropTypes.bool,
	freePlan: PropTypes.bool,
	isDisabled: PropTypes.bool,
	isPlaceholder: PropTypes.bool,
	isLaunchPage: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	planType: PropTypes.string,
	primaryUpgrade: PropTypes.bool,
};

export default localize( PlanFeaturesComparisonActions );
