import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useHelpCenter } from '../../app/help-center';
import { useLocale } from '../../app/locale';
import { Notice } from '../../components/notice';
import { formatDate } from '../../utils/datetime';
import { formatWordPressVersion, getMajorWordPressVersion } from '../../utils/wp-version';
import type { Site, WordPressPrerelease } from '@automattic/api-core';

/** "7.2 Beta" for "7.2-beta2" and "7.2 RC" for "7.2-RC1", as WordPress names its pre-releases. */
function getPrereleaseName( wpVersion: string ) {
	const [ , version, stage ] = wpVersion.match( /^([\d.]+)-(beta|rc)/i ) ?? [];
	if ( ! version ) {
		return formatWordPressVersion( wpVersion, undefined, true );
	}
	return `${ version } ${ stage.toLowerCase() === 'rc' ? 'RC' : 'Beta' }`;
}

/** "December 8" for "2026-12-08". The date is a calendar day, so it is read in UTC to keep it from shifting. */
function formatReleaseDate( releaseDate: string, locale: string ) {
	return formatDate( new Date( `${ releaseDate }T00:00:00Z` ), locale, {
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	} );
}

export function getSwitchBackLabel( stableVersion: string ) {
	return sprintf(
		// translators: %s: WordPress version, e.g. "7.1"
		__( 'Switch back to WordPress %s' ),
		getMajorWordPressVersion( stableVersion )
	);
}

interface AutoEnrolledNoticeProps {
	site: Site;
	prerelease: WordPressPrerelease;
	stableVersion: string;
	actions: React.ReactNode;
}

export function AutoEnrolledNotice( {
	site,
	prerelease,
	stableVersion,
	actions,
}: AutoEnrolledNoticeProps ) {
	const locale = useLocale();
	const { setShowHelpCenter } = useHelpCenter();

	return (
		<Notice
			variant="info"
			actions={ actions }
			title={ sprintf(
				// translators: %s: WordPress version and release stage, e.g. "7.2 Beta" or "7.2 RC"
				__( 'Your site is running WordPress %s as part of early access' ),
				getPrereleaseName( site.options?.software_version ?? '' )
			) }
		>
			{ createInterpolateElement(
				sprintf(
					// translators: %(version)s: the upcoming WordPress version, e.g. "7.2". %(releaseDate)s: its release date, e.g. "December 8". %(stableVersion)s: the current WordPress version, e.g. "7.1".
					__(
						'We picked your site to run WordPress %(version)s before its %(releaseDate)s release, so we can find and fix issues before every site gets it. If you notice anything unexpected, <support>let us know</support>. If you’d rather wait for the release, you can switch back to WordPress %(stableVersion)s. We won’t include your site in future early access releases.'
					),
					{
						version: prerelease.version,
						releaseDate: formatReleaseDate( prerelease.release_date, locale ),
						stableVersion: getMajorWordPressVersion( stableVersion ),
					}
				),
				{
					support: <Button variant="link" onClick={ () => setShowHelpCenter( true ) } />,
				}
			) }
		</Notice>
	);
}
