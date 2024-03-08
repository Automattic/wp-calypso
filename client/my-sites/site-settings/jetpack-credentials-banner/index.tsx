import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import Banner from 'calypso/components/banner';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import {
	getJetpackCredentialsBannerPreference as getPreference,
	JETPACK_CREDENTIALS_BANNER_PREFERENCE,
} from 'calypso/state/site-settings/jetpack-credentials-banner/selectors';
import { Preference, PreferenceType } from './types';

interface Props {
	siteSlug: string;
}

const JetpackCredentialsBanner = ( { siteSlug }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const preference: Preference[] = useSelector( getPreference );

	const savePreferenceType = useCallback(
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

	useEffect( () => {
		savePreferenceType( 'view' );
	}, [] );

	const dismissBanner = useCallback( () => {
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
