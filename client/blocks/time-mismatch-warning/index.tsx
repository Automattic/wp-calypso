/**
 * External dependencies
 */
import React, { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'calypso/components/notice';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import { preventWidows } from 'calypso/lib/formatting';
import { hasReceivedRemotePreferences, getPreference } from 'calypso/state/preferences/selectors';
import { savePreference } from 'calypso/state/preferences/actions';

interface ExternalProps {
	status?: string;
	siteId: number | null;
	settingsUrl: string;
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
