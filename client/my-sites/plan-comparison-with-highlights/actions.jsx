import { Button } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const noop = () => {};
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

const PlanComparisonWithHighlightsActions = ( props ) => {
	return (
		<div className="plan-comparison-with-highlights__actions">
			<div className="plan-comparison-with-highlights__actions-buttons">
				<PlanFeaturesActionsButton { ...props } />
			</div>
		</div>
	);
};

PlanComparisonWithHighlightsActions.propTypes = {
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

export default localize( PlanComparisonWithHighlightsActions );
