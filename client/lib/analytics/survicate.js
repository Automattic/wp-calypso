import config from '@automattic/calypso-config';
import {
	shouldLoadSurvicate,
	loadSurvicateScript,
	isSurvicateScriptLoaded,
	setSurvicateVisitorTraits,
	getAccountAgeInDays,
	SURVICATE_WORKSPACE_ID,
} from '@automattic/survicate';
import { isMobile } from '@automattic/viewport';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';

export function mayWeLoadSurvicateScript() {
	return config( 'survicate_enabled' );
}

export function addSurvicate( { email, registrationDate } ) {
	if (
		! shouldLoadSurvicate( {
			locale: getLocaleSlug(),
			isMobile: !! isMobile(),
		} )
	) {
		return;
	}

	if ( ! mayWeLoadSurvicateScript() ) {
		return;
	}

	const setTraits = () => {
		setSurvicateVisitorTraits( {
			email,
			account_age_in_days: getAccountAgeInDays( registrationDate ),
		} );
	};

	if ( isSurvicateScriptLoaded() ) {
		setTraits();
		return;
	}

	loadSurvicateScript( SURVICATE_WORKSPACE_ID )
		.then( () => setTraits() )
		.catch( () => {} );
}
