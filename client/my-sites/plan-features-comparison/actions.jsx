import { Button } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import CTAButton from '../plugins/plugin-details-CTA/CTA-button';

const noop = () => {};
const PlanFeaturesComparisonActions = ( props ) => {
	return (
		<div className="plan-features-comparison__actions">
			<div className="plan-features-comparison__actions-buttons">
				<PlanFeaturesActionsButton { ...props } />
			</div>
		</div>
	);
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

	if ( window.location.href.indexOf( '/plans/' ) ) {
		const plugin = {
			author: '<a href="https://woocommerce.com">Automattic</a>',
			author_name: 'Automattic',
			author_profile: 'https://profiles.wordpress.org/automattic/',
			author_url: 'https://woocommerce.com',
			banner_video_src: 'https://fast.wistia.net/embed/iframe/1s4yojkmo4',
			description: '<div class="woo-sc-box normal" style="margin-t',
			detailsFetched: 1663792348309,
			documentation_url:
				'https://docs.woocommerce.com/documentation/plugins/woocommerce/woocommerce-extensions/woocommerce-subscriptions/',
			fetched: true,
			icon: 'https://wordpress.com/wp-content/lib/marketplace-images/woocommerce-subscriptions.png',
			id: 902,
			isMarketplaceProduct: true,
			last_updated: '2022-08-04',
			name: 'WooCommerce Subscriptions',
			rating: 68,
			requirements: { plugins: Array( 2 ) },
			screenshots: null,
			sections: {
				description:
					'<div class="woo-sc-box normal">WooCommerce Subscri…ore revenue!</li>\n</ol>\n\n\n\n<h3>FAQs</h3>\n\n\n\n\n\n\n\n\n',
			},
			setup_url: null,
			short_description:
				'Let customers subscribe to your products or services and pay on a weekly, monthly or annual basis.',
			slug: 'woocommerce-subscriptions-monthly',
			tags: { Subscriptions: 'Subscriptions', eCommerce: 'eCommerce' },
			variations: [
				{ monthly: 'woocommerce_subscriptions_monthly' },
				{ yearly: 'woocommerce_subscriptions_yearly' },
			],
			version: '4.5.0',
		};

		return <CTAButton plugin={ plugin } hasEligibilityMessages={ [] } disabled={ false } />;
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
