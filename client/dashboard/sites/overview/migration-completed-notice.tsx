import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { invokeSurvicateEventOnce } from '@automattic/survicate';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { getCurrentDashboard } from '../../app/routing';
import Notice, { NoticeActionLinkButton } from '../../components/notice';
import { getDomainConnectionSetupTemplateUrl } from '../../utils/domain-url';
import { redirectToDashboardLink, wpcomLink } from '../../utils/link';
import { isWordPressMigration } from '../../utils/site-status';
import type { Site } from '@automattic/api-core';

export interface MigrationCompletedSearch {
	/** Set by the migration page when it hands over to the Overview. */
	migration?: 'completed';
}

/**
 * Whether we should show the migration completed notice for a site.
 */
export function useShouldShowMigrationCompletedNotice( site: Site ) {
	const { data: dismissedCompletedAt } = useSuspenseQuery(
		userPreferenceQuery( `site-migration-completed-notice-dismissed-${ site.ID }` )
	);
	const { source_domain, completed_at } = site.site_migration;

	// Note: A dismissal only covers the migration it was made for, so a later migration into the site shows it again.
	if (
		! isWordPressMigration( site ) ||
		! source_domain ||
		! completed_at ||
		dismissedCompletedAt === completed_at
	) {
		return false;
	}

	// 1) Always for the first day, so users landing into the overview for the first time will see it.
	const dayInSeconds = 24 * 60 * 60;
	const age = Date.now() / 1000 - completed_at;
	if ( age < dayInSeconds ) {
		return true;
	}

	// 2) Then for 30 days afterwards, while the source domain still isn't the primary domain.
	const isSourceDomainPrimary = getPrimaryDomain( site ) === source_domain;
	if ( age < 30 * dayInSeconds && ! isSourceDomainPrimary ) {
		return true;
	}

	return false;
}

export function MigrationCompletedNotice( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();
	const { mutate: updateDismissed } = useMutation(
		userPreferenceMutation( `site-migration-completed-notice-dismissed-${ site.ID }` )
	);
	const [ isDismissed, setIsDismissed ] = useState( false );

	// Each migration into the site asks once, whether the user waited for it or came back to it later.
	const completedAt = site.site_migration.completed_at;
	useEffect(
		() => invokeSurvicateEventOnce( 'migrationCompleted', `${ site.ID }:${ completedAt }` ),
		[ site.ID, completedAt ]
	);

	if ( isDismissed ) {
		return null;
	}

	const sourceDomain = site.site_migration.source_domain ?? '';
	const isSourceDomainPrimary = getPrimaryDomain( site ) === sourceDomain;

	const connectDomainUrl = addQueryArgs( wpcomLink( '/setup/domain/use-my-domain' ), {
		initialQuery: sourceDomain,
		step: 'transfer-or-connect',
		siteSlug: site.slug,
		domainConnectionSetupUrl: getDomainConnectionSetupTemplateUrl(),
		dashboard: getCurrentDashboard(),
		back_to: redirectToDashboardLink(),
	} );

	return (
		<Notice
			variant="success"
			title={ __( 'Your site is ready' ) }
			onClose={ () => {
				recordTracksEvent( 'calypso_dashboard_wordpress_migration_completed_notice_dismiss', {
					site_id: site.ID,
				} );
				setIsDismissed( true );
				updateDismissed( site.site_migration.completed_at ?? undefined );
			} }
			actions={
				<>
					{ ! isSourceDomainPrimary && (
						<NoticeActionLinkButton
							variant="solid"
							href={ connectDomainUrl }
							onClick={ () =>
								recordTracksEvent(
									'calypso_dashboard_wordpress_migration_completed_notice_connect_domain_click',
									{ site_id: site.ID }
								)
							}
						>
							{ sprintf(
								/* translators: %s: the domain of the site that was migrated, e.g. example.com. */
								__( 'Connect %s' ),
								sourceDomain
							) }
						</NoticeActionLinkButton>
					) }
					<NoticeActionLinkButton
						variant="outline"
						href={ site.URL }
						openInNewTab
						rel="noopener noreferrer"
						onClick={ () =>
							recordTracksEvent(
								'calypso_dashboard_wordpress_migration_completed_notice_view_site_click',
								{ site_id: site.ID }
							)
						}
					>
						{ __( 'View site' ) }
					</NoticeActionLinkButton>
				</>
			}
		>
			{ isSourceDomainPrimary
				? sprintf(
						/* translators: %s: the domain of the site that was migrated, e.g. example.com. */
						__( '%s is copied and running on WordPress.com.' ),
						sourceDomain
					)
				: sprintf(
						/* translators: %s: the domain of the site that was migrated, e.g. example.com. */
						__(
							'%s is copied and running on WordPress.com. Connect your domain to send your visitors here.'
						),
						sourceDomain
					) }
		</Notice>
	);
}

// The site's primary domain the way `/sites` reports `source_domain`: the host, without a leading www.
function getPrimaryDomain( site: Site ) {
	try {
		return new URL( site.URL ).hostname.replace( /^www\./, '' );
	} catch {
		return '';
	}
}
