import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { CALYPSO_CONTACT, JETPACK_CONTACT_SUPPORT } from '@automattic/urls';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import usePremiumAnalyticsStatusMutation from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-mutation';
import {
	PREMIUM_ANALYTICS_ENABLED_SETTING,
	premiumAnalyticsStatusQueryKey,
} from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query';
import { trackPremiumAnalyticsPreviewEvent } from './track-event';

import './style.scss';

type SwitchOnDialogProps = {
	siteId: number | null;
	/** The new Traffic tab, where the reader lands once the write succeeds. */
	dashboardUrl: string;
	onClose: () => void;
};

/**
 * Confirms switching the new Traffic tab on from the modules menu, then takes the reader there.
 *
 * Opened from a menu, the invitation has none of the banner's framing, so this dialog carries
 * it: what the reader gets, and that they are about to leave the page. The dashboard only exists
 * on a fresh page load, which is why a successful write ends in navigation rather than a link.
 * @param props Component props.
 * @param props.siteId Site to switch on.
 * @param props.dashboardUrl Where to go once it is on.
 * @param props.onClose Called when the reader leaves without switching on.
 */
// Long enough for the Tracks beacon to leave before the page does; the Stats notices use the same.
const NAVIGATION_DELAY = 250;

export default function SwitchOnDialog( { siteId, dashboardUrl, onClose }: SwitchOnDialogProps ) {
	const translate = useTranslate();
	const queryClient = useQueryClient();
	// Which API the site answers on decides where support lives, same as the banner.
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const [ hasFailed, setHasFailed ] = useState( false );
	// Stays busy until the page unloads: the write has succeeded and the reader is on their way.
	const [ isLeaving, setIsLeaving ] = useState( false );

	const { mutateAsync: enablePreviewAsync, isPending: isSwitchingOn } =
		usePremiumAnalyticsStatusMutation( siteId );
	const isBusy = isSwitchingOn || isLeaving;

	useEffect( () => {
		trackPremiumAnalyticsPreviewEvent( 'menu', 'item_clicked', siteId );
	}, [ siteId ] );

	// The browser's Back button can restore this page from the back/forward cache with the dialog
	// still open and locked in its leaving state, so a restored page closes it.
	useEffect( () => {
		const closeOnRestore = ( event: PageTransitionEvent ) => {
			if ( event.persisted ) {
				onClose();
			}
		};
		window.addEventListener( 'pageshow', closeOnRestore );
		return () => window.removeEventListener( 'pageshow', closeOnRestore );
	}, [ onClose ] );

	const cancel = () => {
		trackPremiumAnalyticsPreviewEvent( 'menu', 'cancelled', siteId );
		onClose();
	};

	const switchOn = async () => {
		setHasFailed( false );

		try {
			const enabled = await enablePreviewAsync( true );

			if ( ! enabled ) {
				trackPremiumAnalyticsPreviewEvent( 'menu', 'enable_failed', siteId, {
					reason: 'not_enabled',
				} );
				setHasFailed( true );
				return;
			}
		} catch {
			trackPremiumAnalyticsPreviewEvent( 'menu', 'enable_failed', siteId, {
				reason: 'request_failed',
			} );
			setHasFailed( true );
			return;
		}

		// After the write so a retry counts once, before the navigation so it is not cut short.
		trackPremiumAnalyticsPreviewEvent( 'menu', 'enabled', siteId );
		setIsLeaving( true );
		// The site is on now, so neither the menu entry nor the banner should offer it again.
		queryClient.setQueryData( premiumAnalyticsStatusQueryKey( siteId ), {
			[ PREMIUM_ANALYTICS_ENABLED_SETTING ]: true,
		} );
		setTimeout( () => {
			window.location.href = dashboardUrl;
		}, NAVIGATION_DELAY );
	};

	return (
		<Modal
			className="stats-premium-analytics-preview-dialog"
			title={ translate( 'Switch on the new Traffic tab?' ) }
			onRequestClose={ cancel }
			// Nothing to walk away from halfway through a write that is about to change the answer.
			isDismissible={ ! isBusy }
			shouldCloseOnClickOutside={ ! isBusy }
			shouldCloseOnEsc={ ! isBusy }
			focusOnMount="firstContentElement"
		>
			<p>
				{ translate(
					'Clearer charts, and widgets you can move and resize to suit how you read your site. It’s an early version, and you can switch it off again at any time.'
				) }
			</p>
			<p>
				{ translate(
					'We’ll take you there once it’s on. Your current Stats stay where they are.'
				) }
			</p>
			{ hasFailed && (
				<p className="stats-premium-analytics-preview-dialog__error" role="alert">
					{ translate(
						'We couldn’t switch on the new Traffic tab. Please try again — if it keeps happening, {{link}}get in touch with support{{/link}}.',
						{
							components: {
								link: (
									<a
										href={
											isOdysseyStats ? localizeUrl( JETPACK_CONTACT_SUPPORT ) : CALYPSO_CONTACT
										}
										target="_blank"
										rel="noreferrer"
									/>
								),
							},
						}
					) }
				</p>
			) }
			<div className="stats-premium-analytics-preview-dialog__actions">
				<Button variant="tertiary" onClick={ cancel } disabled={ isBusy }>
					{ translate( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ switchOn }
					isBusy={ isBusy }
					disabled={ isBusy }
					// Keyboard focus survives the button going busy, so the next Tab carries on
					// from here rather than from the top of the page.
					accessibleWhenDisabled
				>
					{ isBusy ? translate( 'Switching it on…' ) : translate( 'Switch it on' ) }
				</Button>
			</div>
		</Modal>
	);
}
