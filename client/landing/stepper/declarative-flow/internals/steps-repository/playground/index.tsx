import config from '@automattic/calypso-config';
import { Step } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { isPlaygroundWooIntent } from 'calypso/landing/stepper/utils/playground-woo-intent';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import { PlaygroundIframe } from './components/playground-iframe';
import { PlaygroundLeaveModal } from './components/playground-leave-modal';
import { PlaygroundSaveModal } from './components/playground-save-modal';
import { getBlueprintLabelForTracking } from './lib/blueprint';
import { DEFAULT_PLAN_INTENT, TRACKS_FLUSH_DELAY, WOO_START_HOSTS_URL } from './lib/constants';
import { parseWooTracksMessage } from './lib/woo-tracks';
import type { Step as StepType } from '../../types';
import type { PlaygroundClient } from './lib/types';

import './style.scss';

type LeaveModalTrigger = 'back' | 'close';
type ActiveModal = 'save' | LeaveModalTrigger;

const isLeaveModal = ( modal: ActiveModal | null ): modal is LeaveModalTrigger =>
	modal === 'back' || modal === 'close';

export const PlaygroundStep: StepType = ( { navigation, flow, stepName } ) => {
	const { submit } = navigation;
	const playgroundClientRef = useRef< PlaygroundClient | null >( null );
	const { __ } = useI18n();
	const [ query ] = useSearchParams();
	const readyForLaunch = query.has( 'playground' );

	const [ isIntroShown, setIsIntroShown ] = useState( false );
	const [ activeModal, setActiveModal ] = useState< ActiveModal | null >( null );
	// Set once the user launches or leaves, so nothing else can start until the page changes.
	const [ isBusy, setIsBusy ] = useState( false );
	const navigationTimeoutRef = useRef< ReturnType< typeof setTimeout > >( undefined );

	const isWooCommerceIntent = isPlaygroundWooIntent( flow, stepName, query.get( 'intent' ) );
	const canLaunch = Boolean( submit ) && readyForLaunch && ! isBusy;

	const setPlaygroundClient = ( client: PlaygroundClient ) => {
		playgroundClientRef.current = client;
	};

	const tracksProps = useMemo(
		() => ( {
			flow,
			step: 'playground',
			blueprint: getBlueprintLabelForTracking( query ),
			is_woocommerce_intent: isWooCommerceIntent,
		} ),
		[ flow, query, isWooCommerceIntent ]
	);

	const recordWooTracksMessage = useCallback(
		( data: unknown ) => {
			const event = parseWooTracksMessage( data );
			if ( event ) {
				recordTracksEvent( event.name, { ...tracksProps, ...event.properties } );
			}
		},
		[ tracksProps ]
	);

	useEffect( () => {
		// Coming back with the browser's Back button can restore this page from the
		// back/forward cache, mid-leave or mid-save, so put it back in a usable state.
		const onPageShow = ( event: PageTransitionEvent ) => {
			if ( event.persisted ) {
				clearTimeout( navigationTimeoutRef.current );
				setIsBusy( false );
				setActiveModal( null );
			}
		};
		window.addEventListener( 'pageshow', onPageShow );
		return () => {
			window.removeEventListener( 'pageshow', onPageShow );
			clearTimeout( navigationTimeoutRef.current );
		};
	}, [] );

	const navigateAfterTracksFlush = ( navigate: () => void ) => {
		clearTimeout( navigationTimeoutRef.current );
		navigationTimeoutRef.current = setTimeout( navigate, TRACKS_FLUSH_DELAY );
	};

	const launchSite = () => {
		if ( ! canLaunch ) {
			return;
		}

		setIsBusy( true );
		const launchTracksProps = { ...tracksProps, intent: DEFAULT_PLAN_INTENT };
		try {
			recordTracksEvent( 'calypso_playground_launch_site', launchTracksProps );
			submit?.();
		} catch ( error ) {
			// Only synchronous throws land here, such as from recording events: Stepper doesn't
			// await the flow's async submit, so its rejections bypass this.
			setIsBusy( false );
			const message = error instanceof Error ? error.message : String( error );
			void logToLogstash( {
				feature: 'calypso_client',
				tags: [ 'playground-launch' ],
				message,
				properties: {
					env: config( 'env_id' ),
					...launchTracksProps,
				},
			} ).catch( () => {} );
			// The launch event, and the save modal's continue event, are already recorded,
			// so record the failure too for the funnel to discount them.
			recordTracksEvent( 'calypso_playground_launch_site_failed', {
				...launchTracksProps,
				error_message: message,
			} );
		}
	};

	const saveStore = () => {
		if ( activeModal !== 'save' || ! canLaunch ) {
			return;
		}

		recordTracksEvent( 'calypso_playground_save_modal_continue', tracksProps );
		launchSite();
	};

	const recordLeaveModalEvent = ( eventName: string, trigger: LeaveModalTrigger ) => {
		recordTracksEvent( eventName, { ...tracksProps, trigger } );
	};

	const openModal = ( modal: ActiveModal ) => {
		// Leaving doesn't need a launchable playground, only an idle step.
		const canOpen = modal === 'save' ? canLaunch : ! isBusy;
		if ( activeModal || ! canOpen ) {
			return;
		}

		if ( modal === 'save' ) {
			recordTracksEvent( 'calypso_playground_save_modal_open', tracksProps );
		} else {
			recordLeaveModalEvent( 'calypso_playground_leave_modal_open', modal );
		}
		setActiveModal( modal );
	};

	const keepBuilding = () => {
		if ( isBusy || ! activeModal ) {
			return;
		}

		if ( activeModal === 'save' ) {
			recordTracksEvent( 'calypso_playground_save_modal_keep_building', tracksProps );
		} else {
			recordLeaveModalEvent( 'calypso_playground_leave_modal_keep_building', activeModal );
		}
		setActiveModal( null );
	};

	const leavePlayground = () => {
		if ( isBusy || ! isLeaveModal( activeModal ) ) {
			return;
		}

		recordLeaveModalEvent( 'calypso_playground_leave_modal_continue', activeModal );
		setIsBusy( true );
		navigateAfterTracksFlush( () => window.location.assign( WOO_START_HOSTS_URL ) );
	};

	return (
		<>
			<DocumentHead title={ __( 'Playground' ) } />
			<Step.PlaygroundLayout
				className="playground"
				topBar={
					// The intro covers the top bar, so keep assistive tech out of it too.
					<div className="playground__top-bar" inert={ isIntroShown }>
						<Step.TopBar
							leftElement={
								isWooCommerceIntent && (
									<Step.BackButton
										className="playground__woo-back-button"
										enableTracksEvent={ false }
										iconSize={ 20 }
										aria-haspopup="dialog"
										disabled={ isBusy }
										accessibleWhenDisabled
										onClick={ () => openModal( 'back' ) }
									>
										<span className="playground__woo-back-button-label">{ __( 'Back' ) }</span>
									</Step.BackButton>
								)
							}
							rightElement={
								<>
									<Step.PrimaryButton
										className={ isWooCommerceIntent ? 'playground__woo-launch-button' : undefined }
										aria-haspopup={ isWooCommerceIntent ? 'dialog' : undefined }
										onClick={ () => ( isWooCommerceIntent ? openModal( 'save' ) : launchSite() ) }
										disabled={ ! canLaunch }
									>
										{ isWooCommerceIntent
											? __( 'Save my store' )
											: __( 'Launch on WordPress.com' ) }
									</Step.PrimaryButton>
									{ isWooCommerceIntent && (
										<Button
											__next40pxDefaultSize
											className="playground__woo-close-button"
											size="small"
											icon={ close }
											label={ __( 'Exit' ) }
											aria-haspopup="dialog"
											disabled={ isBusy }
											accessibleWhenDisabled
											onClick={ () => openModal( 'close' ) }
										/>
									) }
								</>
							}
						/>
					</div>
				}
			>
				<PlaygroundIframe
					className="playground__onboarding-iframe"
					hasPlaygroundClient={ Boolean( playgroundClientRef.current ) }
					setPlaygroundClient={ setPlaygroundClient }
					withIntro={ isWooCommerceIntent }
					onIntroChange={ setIsIntroShown }
					onPlaygroundMessage={ isWooCommerceIntent ? recordWooTracksMessage : undefined }
				/>
			</Step.PlaygroundLayout>
			{ isLeaveModal( activeModal ) && (
				<PlaygroundLeaveModal
					onConfirm={ leavePlayground }
					onCancel={ keepBuilding }
					isConfirming={ isBusy }
				/>
			) }
			{ activeModal === 'save' && (
				<PlaygroundSaveModal
					onConfirm={ saveStore }
					onCancel={ keepBuilding }
					isConfirming={ isBusy }
				/>
			) }
		</>
	);
};

export default PlaygroundStep;
