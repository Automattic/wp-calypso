import { useTranslate } from 'i18n-calypso';
import Banner from 'calypso/components/banner';
import { useSelector } from 'calypso/state';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';

import './style.scss';

const A4A_SIGNUP_URL = 'https://automattic.com/for-agencies/';
const DISMISS_PREFERENCE_NAME = 'jetpack-manage-program-sunset-banner';

export default function ProgramSunsetBanner() {
	const translate = useTranslate();
	const isPartner = useSelector( isAgencyUser );

	// Only Jetpack Manage partners are affected by the program winding down.
	if ( ! isPartner ) {
		return null;
	}

	return (
		<Banner
			className="program-sunset-banner"
			title={ translate( 'The Jetpack Manage partner program is winding down' ) }
			description={ translate( 'See what’s changing and how to keep buying Jetpack products.' ) }
			callToAction={ translate( 'Learn more' ) }
			href={ A4A_SIGNUP_URL }
			target="_blank"
			disableCircle
			horizontal
			dismissPreferenceName={ DISMISS_PREFERENCE_NAME }
			event="jetpack-manage-program-sunset"
			tracksImpressionName="calypso_jetpack_manage_program_sunset_banner_view"
			tracksClickName="calypso_jetpack_manage_program_sunset_banner_click"
			tracksDismissName="calypso_jetpack_manage_program_sunset_banner_dismiss"
		/>
	);
}
