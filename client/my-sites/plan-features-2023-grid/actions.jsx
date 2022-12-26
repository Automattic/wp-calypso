import { Button } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import ExternalLinkWithTracking from 'calypso/components/external-link/with-tracking';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const noop = () => {};

const PlanFeaturesActionsButton = ( {
	className,
	freePlan = false,
	isWpcomEnterpriseGridPlan = false,
	isPlaceholder = false,
	isInSignup,
	isLaunchPage,
	onUpgradeClick = noop,
	planName,
	planType,
	translate,
	flowName,
} ) => {
	const classes = classNames( 'plan-features-2023-grid__actions-button', className );

	const handleUpgradeButtonClick = () => {
		if ( isPlaceholder ) {
			return;
		}

		if ( ! freePlan ) {
			recordTracksEvent( 'calypso_plan_features_upgrade_click', {
				current_plan: null,
				upgrading_to: planType,
			} );
		}

		onUpgradeClick();
	};

	const vipLandingPageUrlWithoutUtmCampaign =
		'https://wpvip.com/wordpress-vip-agile-content-platform?utm_source=WordPresscom&utm_medium=automattic_referral';

	if ( isWpcomEnterpriseGridPlan ) {
		return (
			<Button className={ classes }>
				{ translate( '{{ExternalLink}}Get %(plan)s{{/ExternalLink}}', {
					args: {
						plan: planName,
					},
					components: {
						ExternalLink: (
							<ExternalLinkWithTracking
								href={ `${ vipLandingPageUrlWithoutUtmCampaign }&utm_campaign=calypso_signup` }
								target="_blank"
								tracksEventName="calypso_plan_step_enterprise_click"
								tracksEventProps={ { flow: flowName } }
							/>
						),
					},
				} ) }
			</Button>
		);
	}

	if ( ! isLaunchPage && isInSignup ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ translate( 'Get %(plan)s', {
					args: {
						plan: planName,
					},
				} ) }
			</Button>
		);
	}

	if ( isLaunchPage && ! freePlan ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ translate( 'Get %(plan)s', {
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

	if ( isLaunchPage && freePlan ) {
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

const PlanFeatures2023GridActions = ( props ) => {
	return (
		<div className="plan-features-2023-gridrison__actions">
			<div className="plan-features-2023-gridrison__actions-buttons">
				<PlanFeaturesActionsButton { ...props } />
			</div>
		</div>
	);
};

PlanFeatures2023GridActions.propTypes = {
	className: PropTypes.string,
	freePlan: PropTypes.bool,
	isWpcomEnterpriseGridPlan: PropTypes.bool,
	isPlaceholder: PropTypes.bool,
	isLaunchPage: PropTypes.bool,
	isInSignup: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	planType: PropTypes.string,
	flowName: PropTypes.string,
};

export default localize( PlanFeatures2023GridActions );
