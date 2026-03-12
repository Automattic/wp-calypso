// eslint-disable-next-line no-restricted-imports
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	shouldLoadSurvicate,
	loadSurvicateScript,
	setSurvicateVisitorTraits,
	SURVICATE_WORKSPACE_ID,
} from '@automattic/survicate';
import { useViewportMatch } from '@wordpress/compose';
import { useEffect } from 'react';
import { useAuth } from '../auth';
import { useLocale } from '../locale';

export function useSurvicate() {
	const { user } = useAuth();
	const locale = useLocale();
	const isMobile = useViewportMatch( 'mobile', '<' );

	useEffect( () => {
		if ( ! config( 'survicate_enabled' ) ) {
			return;
		}

		if ( ! shouldLoadSurvicate( { locale, isMobile } ) ) {
			return;
		}

		const controller = new AbortController();

		loadSurvicateScript( SURVICATE_WORKSPACE_ID )
			.then( () => {
				if ( controller.signal.aborted ) {
					return;
				}

				if ( ! user.email ) {
					recordTracksEvent( 'calypso_survicate_user_not_available_error', {
						user_exists: true,
						user_has_email: false,
						referrer: document.referrer || '',
						pathname: window.location.pathname || '',
						hostname: window.location.hostname || '',
					} );
					return;
				}

				const cleanupTraits = setSurvicateVisitorTraits( { email: user.email } );
				controller.signal.addEventListener( 'abort', cleanupTraits );
			} )
			.catch( () => {
				// Script failed to load — nothing to do.
			} );

		return () => {
			controller.abort();
		};
	}, [ user, locale, isMobile ] );
}
