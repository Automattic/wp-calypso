import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useHelpCenter } from '../../app/help-center';
import { useLocale } from '../../app/locale';
import { Notice } from '../../components/notice';
import { formatReleaseDate, getPrereleaseName } from '../../components/wordpress-prerelease-notice';
import { getMajorWordPressVersion } from '../../utils/wp-version';
import type { WordPressPrerelease } from '@automattic/api-core';

export function getSwitchBackLabel( stableVersion: string ) {
	return sprintf(
		// translators: %s: WordPress version, e.g. "7.1"
		__( 'Switch back to WordPress %s' ),
		getMajorWordPressVersion( stableVersion )
	);
}

interface AutoEnrolledNoticeProps {
	prerelease: WordPressPrerelease;
	stableVersion: string;
	actions: React.ReactNode;
}

export function AutoEnrolledNotice( {
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
				getPrereleaseName( prerelease )
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
