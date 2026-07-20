import { rawUserPreferencesQuery } from '@automattic/api-queries';
// eslint-disable-next-line no-restricted-imports
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	shouldLoadSurvicate,
	loadSurvicateScript,
	setSurvicateVisitorTraits,
	getAccountAgeInDays,
	SURVICATE_WORKSPACE_ID,
} from '@automattic/survicate';
import { useQuery } from '@tanstack/react-query';
import { useViewportMatch } from '@wordpress/compose';
import { useEffect, useMemo } from 'react';
import { useAuth } from '../auth';
import { useLocale } from '../locale';
import { VISIT_AREAS } from './visit-areas';

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

				const cleanupTraits = setSurvicateVisitorTraits( {
					email: user.email,
					account_age_in_days: getAccountAgeInDays( user.date ),
				} );
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

/**
 * Publishes per-area visit counts to Survicate as visitor traits, so surveys
 * can target users who have visited an area at least X times (the threshold is
 * configured per survey in the Survicate dashboard). Counts are maintained by
 * `usePersistentVisitCounter`; the trait mapping lives in `visit-areas.ts`.
 *
 * Decoupled from incrementing: this reads the visit-count preferences and
 * re-pushes whenever they change. Relies on `useSurvicate` to load the script;
 * `setSurvicateVisitorTraits` defers until `SurvicateReady` if needed.
 */
export function useSurvicateVisitTraits() {
	const locale = useLocale();
	const isMobile = useViewportMatch( 'mobile', '<' );
	const { data: preferences } = useQuery( rawUserPreferencesQuery() );

	const traits = useMemo( () => {
		const result: Record< string, number > = {};
		if ( preferences ) {
			for ( const area of VISIT_AREAS ) {
				const counter = preferences[ `hosting-dashboard-visit-count-${ area.slug }` ];
				if ( counter && counter.count > 0 ) {
					result[ area.trait ] = counter.count;
				}
			}
		}
		return result;
	}, [ preferences ] );

	const traitsKey = JSON.stringify( traits );

	useEffect( () => {
		if ( ! config( 'survicate_enabled' ) ) {
			return;
		}

		if ( ! shouldLoadSurvicate( { locale, isMobile } ) ) {
			return;
		}

		if ( Object.keys( traits ).length === 0 ) {
			return;
		}

		return setSurvicateVisitorTraits( traits );
		// `traits` is captured via its serialized `traitsKey` to avoid re-pushing
		// on unrelated preference changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ traitsKey, locale, isMobile ] );
}
