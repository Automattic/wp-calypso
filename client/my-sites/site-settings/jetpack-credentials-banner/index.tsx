/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Banner from 'calypso/components/banner';
import { savePreference } from 'calypso/state/preferences/actions';
import {
	getJetpackCredentialsBannerPreference as getPreference,
	JETPACK_CREDENTIALS_BANNER_PREFERENCE,
} from 'calypso/state/site-settings/jetpack-credentials-banner/selectors';
import { Preference, PreferenceType } from './types';

interface Props {
	siteSlug: string;
}

const JetpackCredentialsBanner: React.FC< Props > = ( { siteSlug } ): React.ReactElement => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const preference: Preference[] = useSelector( ( state ) =>
		getPreference( state, JETPACK_CREDENTIALS_BANNER_PREFERENCE )
	);

	const savePreferenceType = React.useCallback(
		( type: PreferenceType ) => {
			dispatch(
				savePreference( JETPACK_CREDENTIALS_BANNER_PREFERENCE, [
					...( preference || [] ),
					{
						date: Date.now(),
						type,
					},
				] )
			);
		},
		[ dispatch, preference ]
	);

	React.useEffect( () => {
		savePreferenceType( 'view' );
	}, [] );

	const dismissBanner = React.useCallback( () => {
		savePreferenceType( 'dismiss' );
	}, [ savePreferenceType ] );

	return (
		<>
			<Banner
				callToAction={ translate( 'Take me there!' ) }
				title={ translate( 'Looking for Jetpack backups and security scans settings?' ) }
				description={ translate(
					"In order to simplify your experience we've moved these to their dedicated section under the Jetpack settings tab."
				) }
				onClick={ dismissBanner }
				href={ `/settings/jetpack/${ siteSlug }` }
				horizontal
				jetpack
			/>
		</>
	);
};

export default JetpackCredentialsBanner;
