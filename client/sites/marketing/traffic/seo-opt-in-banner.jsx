import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import wpcom from 'calypso/lib/wp';

export default function SeoOptInBanner( { siteId, settingsUrl } ) {
	const translate = useTranslate();
	const [ availableSite, setAvailableSite ] = useState( null );

	useEffect( () => {
		let cancelled = false;
		setAvailableSite( null );
		wpcom.req
			.get( `/jetpack-blogs/${ siteId }/rest-api/`, {
				path: '/jetpack/v4/seo/opt-in',
			} )
			.then( ( { data } ) => {
				if ( ! cancelled && data?.optin_available === true ) {
					setAvailableSite( siteId );
				}
			} )
			.catch( () => {
				// Older Jetpack versions do not expose opt-in availability.
			} );
		return () => {
			cancelled = true;
		};
	}, [ siteId ] );

	if ( availableSite !== siteId || ! settingsUrl ) {
		return null;
	}

	return (
		<Notice
			status="is-info"
			showDismiss={ false }
			text={ translate(
				'SEO has a new home. Open Jetpack settings to switch to the new SEO dashboard.'
			) }
		>
			<NoticeAction href={ settingsUrl }>{ translate( 'Open Jetpack settings' ) }</NoticeAction>
		</Notice>
	);
}
