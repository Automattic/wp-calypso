import { Card } from '@automattic/components';
import { Notice } from '@wordpress/components';
import { usePrevious } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useCallback } from 'react';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getFormSettings } from 'calypso/my-sites/site-settings/form-discussion';
import { useDispatch, useSelector } from 'calypso/state';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import { saveJetpackSettings } from 'calypso/state/jetpack/settings/actions';
import getJetpackSettings from 'calypso/state/selectors/get-jetpack-settings';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import useBannerDismissReducer from './use-banner-dismiss-reducer';
import useSubscriptionBanner from './use-subscription-banner';

import './style.scss';

const moduleSlug = 'subscriptions';

export default function SubscriptionsModuleBanner() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const site = useSelector( getSelectedSite );
	const siteId = site?.ID;
	const siteJetpackSettings = useSelector( ( state ) => {
		if ( ! siteId ) {
			return null;
		}
		return getJetpackSettings( state, siteId );
	} );
	const isModuleActive = useSelector( ( state ) => {
		if ( ! siteId ) {
			return null;
		}
		return isJetpackModuleActive( state, siteId, moduleSlug );
	} );
	const prevIsModuleActive = usePrevious( isModuleActive );
	const [ bannerState, bannerDispatch ] = useBannerDismissReducer();
	const showSubscriptionBanner = useSubscriptionBanner( siteId, bannerState.dismissed );

	/**
	 * Callbacks
	 */
	const onEnableSubscriptionsModule = useCallback( () => {
		if ( typeof siteId === 'number' ) {
			dispatch( activateModule( siteId, moduleSlug ) );
			recordTracksEvent( 'calypso_subscriptions_module_enable' );
		}
	}, [ dispatch, siteId ] );

	const onNoticeDismiss = useCallback( () => {
		bannerDispatch( { type: 'dismiss', payload: true } );
		recordTracksEvent( 'calypso_subscriptions_banner_dismiss' );
	}, [ bannerDispatch ] );

	const onModuleActivationTransition = useCallback( () => {
		const settings = {
			...getFormSettings( siteJetpackSettings ),
			stb_enabled: true,
			stc_enabled: true,
		};
		dispatch( saveJetpackSettings( siteId, settings ) );
	}, [ siteJetpackSettings, dispatch, siteId ] );

	/**
	 * Effects
	 */
	useEffect( () => {
		if ( ! prevIsModuleActive && isModuleActive ) {
			onModuleActivationTransition();
		}
	}, [ isModuleActive, onModuleActivationTransition, prevIsModuleActive ] );

	/**
	 * Templates
	 */
	return (
		<>
			{ siteId && <QueryJetpackModules siteId={ siteId } /> }
			{ showSubscriptionBanner && (
				<Card className="subscriptions-module-banner">
					<Notice
						status="info"
						onRemove={ onNoticeDismiss }
						actions={ [
							{
								label: translate( 'Enable' ),
								className: 'is-compact is-primary',
								onClick: onEnableSubscriptionsModule,
							},
						] }
					>
						<strong>
							{ translate(
								"Activate post and comment subscriptions to ensure your site visitors don't miss a thing"
							) }
						</strong>
					</Notice>
				</Card>
			) }
		</>
	);
}
