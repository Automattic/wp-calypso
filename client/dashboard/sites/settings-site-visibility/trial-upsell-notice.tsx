import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import ComponentViewTracker from '../../components/component-view-tracker';
import Notice from '../../components/notice';
import { DotcomPlans } from '../../data/constants';
import { isSitePlanLaunchable } from '../plans';
import type { Site } from '../../data/types';

export default function TrialUpsellNotice( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();
	const isSiteOnECommerceTrial = site.plan?.product_slug === DotcomPlans.ECOMMERCE_TRIAL_MONTHLY;
	const isSiteOnMigrationTrial = site.plan?.product_slug === DotcomPlans.MIGRATION_TRIAL_MONTHLY;

	if ( isSitePlanLaunchable( site ) ) {
		return null;
	}

	const handleClick = ( type?: string ) => {
		recordTracksEvent( 'calypso_dashboard_trial_upsell_notice_click', { type } );
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
					a: <Button { ...buttonProps } onClick={ () => handleClick( 'ecommerce' ) } />,
				}
			);
		}

		if ( isSiteOnMigrationTrial ) {
			return createInterpolateElement(
				__( 'Ready to launch your site? <a>Upgrade to a paid plan</a>.' ),
				{
					a: <Button { ...buttonProps } onClick={ () => handleClick( 'migration' ) } />,
				}
			);
		}

		return createInterpolateElement(
			__( 'Ready to launch your site? <a>Upgrade to a paid plan</a>.' ),
			{
				a: <Button { ...buttonProps } onClick={ () => handleClick() } />,
			}
		);
	};

	return (
		<>
			<ComponentViewTracker eventName="calypso_dashboard_trial_upsell_notice_impression" />
			<Notice variant="warning">{ renderContent() }</Notice>
		</>
	);
}
