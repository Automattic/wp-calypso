import { Step } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { isPlaygroundWooIntent } from 'calypso/landing/stepper/utils/playground-woo-intent';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PlaygroundIframe } from './components/playground-iframe';
import { PlaygroundLeaveModal } from './components/playground-leave-modal';
import { getBlueprintLabelForTracking } from './lib/blueprint';
import { DEFAULT_PLAN_INTENT, TRACKS_FLUSH_DELAY, WOO_START_HOSTS_URL } from './lib/constants';
import type { Step as StepType } from '../../types';
import type { PlaygroundClient } from './lib/types';
import './style.scss';

type LeaveModalTrigger = 'back' | 'close';

export const PlaygroundStep: StepType = ( { navigation, flow, stepName } ) => {
	const { submit } = navigation;
	const playgroundClientRef = useRef< PlaygroundClient | null >( null );
	const { __ } = useI18n();
	const [ query ] = useSearchParams();
	const readyForLaunch = query.has( 'playground' );

	// For preventing double click on launch button
	const [ isLaunching, setIsLaunching ] = useState( false );
	const [ isIntroShown, setIsIntroShown ] = useState( false );

	const [ leaveModalTrigger, setLeaveModalTrigger ] = useState< LeaveModalTrigger | null >( null );
	const [ isLeaving, setIsLeaving ] = useState( false );
	const leaveTimeoutRef = useRef< ReturnType< typeof setTimeout > >( undefined );

	const isWooCommerceIntent = isPlaygroundWooIntent( flow, stepName, query.get( 'intent' ) );

	const setPlaygroundClient = ( client: PlaygroundClient ) => {
		playgroundClientRef.current = client;
	};

	useEffect( () => {
		// Coming back with the browser's Back button can restore this page from the
		// back/forward cache, mid-leave, so put it back in a usable state.
		const onPageShow = ( event: PageTransitionEvent ) => {
			if ( event.persisted ) {
				clearTimeout( leaveTimeoutRef.current );
				setIsLeaving( false );
				setLeaveModalTrigger( null );
			}
		};
		window.addEventListener( 'pageshow', onPageShow );
		return () => {
			window.removeEventListener( 'pageshow', onPageShow );
			clearTimeout( leaveTimeoutRef.current );
		};
	}, [] );

	const launchSite = async () => {
		if ( ! submit || isLaunching || isLeaving ) {
			return;
		}

		setIsLaunching( true );

		try {
			recordTracksEvent( 'calypso_playground_launch_site', {
				flow,
				step: 'playground',
				blueprint: getBlueprintLabelForTracking( query ),
				intent: DEFAULT_PLAN_INTENT,
				is_woocommerce_intent: isWooCommerceIntent,
			} );

			submit();
		} catch ( error ) {
			setIsLaunching( false );
		}
	};

	const recordLeaveModalEvent = ( eventName: string, trigger: LeaveModalTrigger ) => {
		recordTracksEvent( eventName, {
			flow,
			step: 'playground',
			blueprint: getBlueprintLabelForTracking( query ),
			is_woocommerce_intent: isWooCommerceIntent,
			trigger,
		} );
	};

	const openLeaveModal = ( trigger: LeaveModalTrigger ) => {
		if ( isLaunching || isLeaving ) {
			return;
		}

		recordLeaveModalEvent( 'calypso_playground_leave_modal_open', trigger );
		setLeaveModalTrigger( trigger );
	};

	const keepBuilding = () => {
		if ( isLeaving ) {
			return;
		}

		if ( leaveModalTrigger ) {
			recordLeaveModalEvent( 'calypso_playground_leave_modal_keep_building', leaveModalTrigger );
		}
		setLeaveModalTrigger( null );
	};

	const leavePlayground = () => {
		if ( ! leaveModalTrigger || isLeaving || isLaunching ) {
			return;
		}

		setIsLeaving( true );
		recordLeaveModalEvent( 'calypso_playground_leave_modal_continue', leaveModalTrigger );
		leaveTimeoutRef.current = setTimeout(
			() => window.location.assign( WOO_START_HOSTS_URL ),
			TRACKS_FLUSH_DELAY
		);
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
										disabled={ isLaunching }
										accessibleWhenDisabled
										onClick={ () => openLeaveModal( 'back' ) }
									>
										<span className="playground__woo-back-button-label">{ __( 'Back' ) }</span>
									</Step.BackButton>
								)
							}
							rightElement={
								<>
									<Step.PrimaryButton
										className={ isWooCommerceIntent ? 'playground__woo-launch-button' : undefined }
										onClick={ launchSite }
										disabled={ isLaunching || isLeaving || ! readyForLaunch }
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
											disabled={ isLaunching }
											accessibleWhenDisabled
											onClick={ () => openLeaveModal( 'close' ) }
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
				/>
			</Step.PlaygroundLayout>
			{ leaveModalTrigger && (
				<PlaygroundLeaveModal
					onConfirm={ leavePlayground }
					onCancel={ keepBuilding }
					isConfirming={ isLeaving }
				/>
			) }
		</>
	);
};

export default PlaygroundStep;
