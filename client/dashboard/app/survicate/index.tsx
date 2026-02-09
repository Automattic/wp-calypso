// eslint-disable-next-line no-restricted-imports
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	shouldLoadSurvicate,
	loadSurvicateScript,
	setSurvicateVisitorTraits,
	SURVICATE_WORKSPACE_ID,
} from '@automattic/survicate';
import { isMobile } from '@automattic/viewport';
import { useEffect } from 'react';
import { useAuth } from '../auth';

function getLocaleFromUser( user: { locale_variant?: string; language?: string } ): string {
	type ComputedAttributes = { localeSlug?: string; localeVariant?: string };
	const u = user as typeof user & ComputedAttributes;
	return u.localeVariant || u.localeSlug || user.locale_variant || user.language || 'en';
}

export function SurvicateProvider( { children }: { children: React.ReactNode } ) {
	const { user } = useAuth();

	useEffect( () => {
		if ( ! config( 'survicate_enabled' ) ) {
			return;
		}

		const locale = getLocaleFromUser( user );

		if ( ! shouldLoadSurvicate( { locale, isMobile: !! isMobile() } ) ) {
			return;
		}

		loadSurvicateScript( SURVICATE_WORKSPACE_ID )
			.then( () => {
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

				setSurvicateVisitorTraits( { email: user.email } );
			} )
			.catch( () => {
				// Script failed to load — nothing to do.
			} );
	}, [ user ] );

	return children;
}
