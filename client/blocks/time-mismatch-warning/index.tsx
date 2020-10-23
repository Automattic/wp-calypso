/**
 * External dependencies
 */
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'calypso/components/notice';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';

interface ExternalProps {
	status?: string;
	siteId?: number;
}

export const TimeMismatchWarning: FC< ExternalProps > = ( {
	status = 'is-warning',
	siteId,
}: ExternalProps ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( ( state ) => siteId && getSiteSlug( state, siteId ) );
	const settingsUrl = siteSlug ? `/settings/general/${ siteSlug }` : '#';
	const userOffset = new Date().getTimezoneOffset() / -60; // Negative as function returns minutes *behind* UTC.
	const siteOffset = useSelector( ( state ) => siteId && getSiteGmtOffset( state, siteId ) );

	if ( ! siteId || siteOffset === null || userOffset === siteOffset ) {
		return null;
	}

	return (
		<Notice status={ status }>
			{ translate(
				'Looks like your computer time and site time don’t match! ' +
					'We’re going to show you times based on your site. ' +
					'If that doesn’t look right, you can {{SiteSettings}}go here to update it{{/SiteSettings}}.',
				{
					components: {
						SiteSettings: <a href={ settingsUrl } />,
					},
				}
			) }
		</Notice>
	);
};

export default TimeMismatchWarning;
