import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import Notice, { NoticeStatus } from 'calypso/components/notice';
import { preventWidows } from 'calypso/lib/formatting';
import { useSelector, useDispatch } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { hasReceivedRemotePreferences, getPreference } from 'calypso/state/preferences/selectors';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';

interface ExternalProps {
	status?: NoticeStatus;
	siteId: number | null;
	settingsUrl?: string | null;
}

export const TimeMismatchWarning: FC< ExternalProps > = ( {
	status = 'is-warning',
	siteId,
	settingsUrl,
}: ExternalProps ) => {
	const dismissPreference = `time-mismatch-warning-${ siteId }`;

	const translate = useTranslate();
	const dispatch = useDispatch();
	const userOffset = new Date().getTimezoneOffset() / -60; // Negative as function returns minutes *behind* UTC.
	const siteOffset = useSelector( ( state ) => siteId && getSiteGmtOffset( state, siteId ) );
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const isDismissed = useSelector(
		( state ) => siteId && getPreference( state, dismissPreference )
	);

	if (
		! siteId ||
		! hasPreferences ||
		! settingsUrl ||
		isDismissed ||
		siteOffset === null ||
		userOffset === siteOffset
	) {
		return null;
	}

	const dismissClick = () => dispatch( savePreference( dismissPreference, 1 ) );

	return (
		<Notice status={ status } onDismissClick={ dismissClick }>
			{ preventWidows(
				translate(
					'This page reflects the time zone set on your site. ' +
						'It looks like that does not match your current time zone. ' +
						'{{SiteSettings}}You can update your site time zone here{{/SiteSettings}}.',
					{
						components: {
							SiteSettings: <a href={ settingsUrl } />,
						},
					}
				)
			) }
		</Notice>
	);
};

export default TimeMismatchWarning;
