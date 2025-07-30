import config from '@automattic/calypso-config';
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

	if ( survicateScriptLoaded || ! mayWeLoadSurvicateScript() ) {
		survicateDebug( 'Not loading Survicate script' );
		return;
	}

	( function () {
		const s = document.createElement( 'script' );
		s.src = `https://survey.survicate.com/workspaces/${ workspaceId }/web_surveys.js`;
		s.async = true;
		const e = document.getElementsByTagName( 'script' )[ 0 ];
		e.parentNode.insertBefore( s, e );

		survicateDebug( 'Survicate script loaded' );
	} )();

	survicateScriptLoaded = true;
}
