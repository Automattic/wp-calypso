import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import Notice from '../../components/notice';
import {
	isSiteOnECommerceTrial as getIsSiteOnECommerceTrial,
	isSiteOnMigrationTrial as getIsSiteOnMigrationTrial,
	isSiteLaunchable,
} from '../../utils/site-plans';
import type { Site } from '../../data/types';

export default function TrialUpsellNotice( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();
	const isSiteOnECommerceTrial = getIsSiteOnECommerceTrial( site );
	const isSiteOnMigrationTrial = getIsSiteOnMigrationTrial( site );
	const isLaunchable = isSiteLaunchable( site );

	useEffect( () => {
		if ( ! isLaunchable ) {
			recordTracksEvent( 'calypso_settings_trial_upsell_notice_impression' );
		}
	}, [ recordTracksEvent, isLaunchable ] );

	if ( isLaunchable ) {
		return null;
	}

	const handleClick = ( type?: string ) => {
		recordTracksEvent( 'calypso_settings_trial_upsell_notice_click', { type } );
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

	return <Notice variant="warning">{ renderContent() }</Notice>;
}
