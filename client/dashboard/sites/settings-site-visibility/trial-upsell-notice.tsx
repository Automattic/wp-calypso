import { DotcomPlans } from '@automattic/api-core';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import ComponentViewTracker from '../../components/component-view-tracker';
import Notice from '../../components/notice';
import { isSitePlanLaunchable } from '../plans';
import type { Site } from '@automattic/api-core';

export default function TrialUpsellNotice( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();
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

	const handleClick = () => {
		recordTracksEvent( 'calypso_dashboard_upsell_click', {
			feature: 'plans',
			type: `trial-notice:${ getTrialType() }`,
		} );
	};

	const renderContent = () => {
		const buttonProps = {
			variant: 'link' as const,
			href: `/plans/${ site.slug }`,
		};

		if ( isSiteOnECommerceTrial ) {
			return createInterpolateElement(
				__( 'Before you can share your store with the world, you need to <a>pick a plan</a>.' ),
				{
					a: <Button { ...buttonProps } onClick={ handleClick } />,
				}
			);
		}

		if ( isSiteOnMigrationTrial ) {
			return createInterpolateElement(
				__( 'Ready to launch your site? <a>Upgrade to a paid plan</a>.' ),
				{
					a: <Button { ...buttonProps } onClick={ handleClick } />,
				}
			);
		}

		return createInterpolateElement(
			__( 'Ready to launch your site? <a>Upgrade to a paid plan</a>.' ),
			{
				a: <Button { ...buttonProps } onClick={ handleClick } />,
			}
		);
	};

	return (
		<>
			<ComponentViewTracker
				eventName="calypso_dashboard_upsell_impression"
				properties={ { feature: 'plans', type: `trial-notice:${ getTrialType() }` } }
			/>
			<Notice variant="warning">{ renderContent() }</Notice>
		</>
	);
}
