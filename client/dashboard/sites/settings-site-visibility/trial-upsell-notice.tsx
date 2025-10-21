import { DotcomPlans } from '@automattic/api-core';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Notice from '../../components/notice';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { isSitePlanLaunchable } from '../plans';
import type { Site } from '@automattic/api-core';

export default function TrialUpsellNotice( { site }: { site: Site } ) {
	const isSiteOnECommerceTrial = site.plan?.product_slug === DotcomPlans.ECOMMERCE_TRIAL_MONTHLY;
	const isSiteOnMigrationTrial = site.plan?.product_slug === DotcomPlans.MIGRATION_TRIAL_MONTHLY;

	if ( isSitePlanLaunchable( site ) ) {
		return null;
	}

	const getTrialType = () => {
		if ( isSiteOnECommerceTrial ) {
			return 'ecommerce';
		}

		if ( isSiteOnMigrationTrial ) {
			return 'migration';
		}

		return site.plan?.product_slug ?? 'free';
	};

	const renderContent = () => {
		const upsellCTALink = (
			<UpsellCTAButton
				variant="link"
				href={ `/plans/${ site.slug }` }
				upsellId={ `site-settings-visibility-trial-notice:${ getTrialType() }` }
				upsellFeatureId="site-trial"
			/>
		);

		if ( isSiteOnECommerceTrial ) {
			return createInterpolateElement(
				__( 'Before you can share your store with the world, you need to <a>pick a plan</a>.' ),
				{
					a: upsellCTALink,
				}
			);
		}

		if ( isSiteOnMigrationTrial ) {
			return createInterpolateElement(
				__( 'Ready to launch your site? <a>Upgrade to a paid plan</a>.' ),
				{
					a: upsellCTALink,
				}
			);
		}

		return createInterpolateElement(
			__( 'Ready to launch your site? <a>Upgrade to a paid plan</a>.' ),
			{
				a: upsellCTALink,
			}
		);
	};

	return <Notice variant="warning">{ renderContent() }</Notice>;
}
