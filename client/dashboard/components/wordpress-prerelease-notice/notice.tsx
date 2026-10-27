import { userPreferenceOptimisticMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import Notice from '../notice';
import RouterLinkButton from '../router-link-button';
import { formatReleaseDate, getPrereleaseName } from './use-auto-enrolled-prerelease';
import type { Site, WordPressPrerelease } from '@automattic/api-core';

/** Holds the release the notice was dismissed for, so the next one the site is auto-enrolled in shows it again. */
export function getDismissalPreferenceName( siteId: number ) {
	return `hosting-dashboard-wp-prerelease-notice-dismissed-${ siteId }` as const;
}

export function WordPressPrereleaseNotice( {
	site,
	prerelease,
	recordTracksEvent,
}: {
	site: Site;
	prerelease: WordPressPrerelease;
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
} ) {
	const locale = useLocale();
	const { mutate: saveDismissal } = useMutation(
		userPreferenceOptimisticMutation( getDismissalPreferenceName( site.ID ) )
	);
	const eventProperties = { site_id: site.ID, version: prerelease.version };

	const handleDismiss = () => {
		recordTracksEvent( 'calypso_dashboard_wp_prerelease_notice_dismiss', eventProperties );
		saveDismissal( prerelease.version );
	};

	return (
		<Notice
			onClose={ handleDismiss }
			actions={
				<RouterLinkButton
					__next40pxDefaultSize
					variant="secondary"
					to={ `/sites/${ site.slug }/settings/wordpress` }
					onClick={ () =>
						recordTracksEvent(
							'calypso_dashboard_wp_prerelease_notice_learn_more_click',
							eventProperties
						)
					}
				>
					{ __( 'Learn more' ) }
				</RouterLinkButton>
			}
		>
			{ sprintf(
				// translators: %(version)s: WordPress version and release stage, e.g. "7.2 Beta" or "7.2 RC". %(releaseDate)s: the release date, e.g. "December 8".
				__(
					'Your site is running WordPress %(version)s as part of early access. If you’d rather wait for the %(releaseDate)s release, you can switch back.'
				),
				{
					version: getPrereleaseName( prerelease ),
					releaseDate: formatReleaseDate( prerelease.release_date, locale ),
				}
			) }
		</Notice>
	);
}
