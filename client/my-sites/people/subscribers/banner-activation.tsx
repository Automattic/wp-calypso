import { Card } from '@automattic/components';
import { Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useCallback } from 'react';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import useBannerDismissReducer from 'calypso/my-sites/people/subscribers/hooks/use-banner-dismiss-reducer';
import useSubscriptionBanner from 'calypso/my-sites/people/subscribers/hooks/use-subscription-banner';
import { getFormSettings } from 'calypso/my-sites/site-settings/form-discussion';
import { useDispatch, useSelector } from 'calypso/state';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import { saveJetpackSettings } from 'calypso/state/jetpack/settings/actions';
import getJetpackSettings from 'calypso/state/selectors/get-jetpack-settings';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export default function BannerActivation() {
	const moduleSlug = 'subscriptions';
	const translate = useTranslate();
	const dispatch = useDispatch();

	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const siteId = site?.ID as number;
	const siteJetpackSettings = useSelector( ( state ) => getJetpackSettings( state, siteId ) );
	const isModuleActive = useSelector( ( state ) =>
		isJetpackModuleActive( state, siteId, moduleSlug )
	);
	const isModuleActiveRef = useRef( isModuleActive );
	const [ bannerState, bannerDispatch ] = useBannerDismissReducer();
	const showSubscriptionBanner = useSubscriptionBanner( siteId, bannerState.dismissed );

	/**
	 * Callbacks
	 */
	const prepareModuleSettings = useCallback( () => {
		return Object.assign( {}, getFormSettings( siteJetpackSettings ), {
			stb_enabled: true,
			stc_enabled: true,
		} );
	}, [ getFormSettings, siteJetpackSettings ] );

	const onEnableSubscriptionsModule = useCallback( () => {
		dispatch( activateModule( siteId, moduleSlug ) );
		recordTracksEvent( 'calypso_subscriptions_module_enable' );
	}, [ siteId ] );

	const onNoticeDismiss = useCallback( () => {
		bannerDispatch( { type: 'dismiss', payload: true } );
		recordTracksEvent( 'calypso_subscriptions_banner_dismiss' );
	}, [] );

	const onModuleActivationTransition = useCallback( () => {
		const settings = prepareModuleSettings();
		dispatch( saveJetpackSettings( siteId, settings ) );
	}, [ siteId, prepareModuleSettings ] );

	const detectModuleActivationTransition = useCallback( () => {
		if ( ! isModuleActiveRef.current && isModuleActive ) {
			onModuleActivationTransition();
		}
	}, [ isModuleActive ] );

	/**
	 * Effects
	 */
	useEffect( detectModuleActivationTransition, [ detectModuleActivationTransition ] );
	useEffect( () => {
		isModuleActiveRef.current = isModuleActive;
	}, [ isModuleActive ] );

	/**
	 * Templates
	 */
	return (
		<>
			{ siteId && <QueryJetpackModules siteId={ siteId } /> }
			{ showSubscriptionBanner && (
				<Card className="people-subscription-banner">
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
