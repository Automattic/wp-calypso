import { getCurrentUser } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { isMobile } from '@automattic/viewport';
import debug from 'debug';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
const survicateDebug = debug( 'calypso:analytics:survicate' );

let survicateScriptLoaded = false;

export function mayWeLoadSurvicateScript() {
	return config( 'survicate_enabled' );
}

export function addSurvicate() {
	const workspaceId = 'e4794374cce15378101b63de24117572';

	// Only add survicate for en languages
	if ( ! getLocaleSlug().startsWith( 'en' ) ) {
		survicateDebug( 'Not loading Survicate script for non-en language' );
		return;
	}

	if ( isMobile() ) {
		survicateDebug( 'Not loading Survicate script on mobile device' );
		return;
	}

	if ( survicateScriptLoaded || ! mayWeLoadSurvicateScript() ) {
		survicateDebug( 'Not loading Survicate script' );
		return;
	}

	( function () {
		const s = document.createElement( 'script' );
		s.src = `https://survey.survicate.com/workspaces/${ workspaceId }/web_surveys.js`;
		s.async = true;

		// Wait for the script to load before setting visitor traits
		s.onload = function () {
			survicateDebug( 'Survicate script loaded' );

			const user = getCurrentUser();

			setTimeout( () => {
				// eslint-disable-next-line no-undef
				if ( typeof _sva !== 'undefined' && _sva.setVisitorTraits ) {
					// eslint-disable-next-line no-undef
					_sva.setVisitorTraits( {
						email: user.email,
					} );
					survicateDebug( 'Survicate visitor traits set with email: ' + user.email );
				} else {
					survicateDebug( 'Survicate _sva object not available' );
				}
			}, 1000 );
		};

		s.onerror = function () {
			survicateDebug( 'Failed to load Survicate script' );
		};

		const e = document.getElementsByTagName( 'script' )[ 0 ];
		e.parentNode.insertBefore( s, e );
	} )();

	survicateScriptLoaded = true;
}
