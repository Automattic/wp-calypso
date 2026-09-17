import { Button, ProgressBar } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useWaitHeartbeat } from 'calypso/lib/analytics/wait-heartbeat';
import { useInterval } from 'calypso/lib/interval';
import { isWpMobileApp } from 'calypso/lib/mobile-app';

// The install phase waits on an Atomic transfer the client cannot observe finishing. The slowest
// real one in a week of transfers took 123s, so this cuts off no legitimate wait.
const INSTALL_DEADLINE_MS = 180 * 1000;

const TICK_MS = 1000;

const HELP_CENTER_STORE = HelpCenter.register();

/**
 * The upload's two phases. The first counts real bytes; the second pulses, because the transfer
 * and install behind it report nothing until they are done. Give that second phase a deadline, so
 * a poll that dies ends in a verdict rather than in a bar that pulses forever.
 *
 * Mount this keyed by site: everything below belongs to one site's upload.
 */
export default function ThemeUploadProgress( {
	siteId,
	siteSlug,
	siteUrl,
	themeId,
	installing,
	isJetpack,
	progressLoaded,
	progressTotal,
} ) {
	const translate = useTranslate();
	const { setOpenOdieWithContext } = useDataStoreDispatch( HELP_CENTER_STORE );
	const [ timedOut, setTimedOut ] = useState( false );

	// `installing` is a selector comparing the two progress figures, so it reads true before either
	// exists — an upload that has not reported a byte yet looks identical to a finished one. Both
	// upload paths populate these, so real progress is what separates the phases.
	const isInstalling =
		installing && progressTotal != null && progressTotal > 0 && progressLoaded != null;

	// Wall clock rather than a timeout: a backgrounded tab throttles timers, and the deadline should
	// measure the wait, not how often the browser let us look at it.
	const installingSinceRef = useRef( null );
	if ( isInstalling && installingSinceRef.current === null ) {
		installingSinceRef.current = Date.now();
	} else if ( ! isInstalling && installingSinceRef.current !== null ) {
		installingSinceRef.current = null;
	}

	useInterval(
		() => {
			const startedAt = installingSinceRef.current;
			if ( startedAt !== null && Date.now() - startedAt >= INSTALL_DEADLINE_MS ) {
				setTimedOut( true );
			}
		},
		isInstalling && ! timedOut ? TICK_MS : null
	);

	useWaitHeartbeat( {
		surface: 'theme_upload',
		enabled: !! siteId && ! timedOut,
		properties: {
			site_id: siteId,
			theme_id: themeId ?? null,
			phase: isInstalling ? 'install' : 'upload',
			is_jetpack: !! isJetpack,
			outcome: timedOut ? 'timeout' : null,
		},
	} );

	const reportedTimeoutRef = useRef( false );
	useEffect( () => {
		if ( ! timedOut || reportedTimeoutRef.current ) {
			return;
		}
		reportedTimeoutRef.current = true;
		recordTracksEvent( 'calypso_theme_upload_wait_timeout', {
			site_id: siteId,
			theme_id: themeId ?? null,
			is_jetpack: !! isJetpack,
		} );
	}, [ timedOut, siteId, themeId, isJetpack ] );

	const recordCtaClick = ( action ) =>
		recordTracksEvent( 'calypso_theme_upload_wait_timeout_click', { action, site_id: siteId } );

	// In place rather than /help/contact: that route leaves Calypso entirely, and the support
	// conversation would start without the site or the failure that prompted it.
	const openHelpCenter = () => {
		recordCtaClick( 'contact_support' );
		setOpenOdieWithContext( {
			initialMessage: translate(
				'My theme upload is stuck. The install has been running for several minutes without finishing.'
			),
			section: 'themes',
			siteUrl,
			siteId,
		} );
	};

	// The mobile app never mounts the Help Center, so opening it there would do nothing visible.
	const supportButtonProps = isWpMobileApp()
		? {
				href: localizeUrl( 'https://wordpress.com/support' ),
				onClick: () => recordCtaClick( 'contact_support' ),
		  }
		: { onClick: openHelpCenter };

	if ( timedOut ) {
		return (
			<div className="theme-upload__timeout">
				<p className="theme-upload__timeout-message">
					{ translate(
						'Installing this theme is taking longer than expected. It may still finish on its own — check your themes in a few minutes.'
					) }
				</p>
				<div className="theme-upload__action-buttons">
					<Button { ...supportButtonProps }>{ translate( 'Contact support' ) }</Button>
					<Button
						primary
						href={ `/themes/${ siteSlug }` }
						onClick={ () => recordCtaClick( 'go_to_themes' ) }
					>
						{ translate( 'Go to themes' ) }
					</Button>
				</div>
			</div>
		);
	}

	const installingMessage = isJetpack
		? translate( 'Installing your theme…' )
		: translate( 'Configuring your site…' );

	return (
		<div>
			<span className="theme-upload__title">
				{ isInstalling ? installingMessage : translate( 'Uploading your theme…' ) }
			</span>
			<ProgressBar
				value={ progressLoaded || 0 }
				total={ progressTotal || 100 }
				title={ translate( 'Uploading progress' ) }
				isPulsing={ isInstalling }
			/>
		</div>
	);
}

ThemeUploadProgress.propTypes = {
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
	siteUrl: PropTypes.string,
	themeId: PropTypes.string,
	installing: PropTypes.bool,
	isJetpack: PropTypes.bool,
	progressLoaded: PropTypes.number,
	progressTotal: PropTypes.number,
};
