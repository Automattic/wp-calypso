import { useNavigate } from '@tanstack/react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { sitesRoute } from '../app/router/sites';
import InlineSupportLink from '../components/inline-support-link';
import Notice from '../components/notice';
import { OptInWelcome } from '../components/opt-in-welcome';

const RestoringSitesNotices = ( { onClose }: { onClose?: () => void } ) => {
	return (
		<Notice title={ __( 'Choose which sites you’d like to restore' ) } onClose={ onClose }>
			{ createInterpolateElement(
				__(
					'<restoreSiteLink>Restore sites</restoreSiteLink> from the action menu. You’ll also need to <invitePeopleLink>invite any users</invitePeopleLink> that previously had access to your sites.'
				),
				{
					restoreSiteLink: <InlineSupportLink supportContext="restore-site" />,
					invitePeopleLink: <InlineSupportLink supportContext="invite-people" />,
				}
			) }
		</Notice>
	);
};

// We still need to implement MigrationPendingNotice and A8CForAgenciesNotice,
// and then display the first available notice.
// See client/sites/components/sites-dashboard-banners-manager.tsx.
export const SitesNotices = () => {
	const navigate = useNavigate( { from: sitesRoute.fullPath } );
	const currentSearchParams = sitesRoute.useSearch();
	const isRestoringAccount = !! currentSearchParams.restored;

	if ( ! window?.location?.pathname?.startsWith( '/v2' ) ) {
		// Notices should not appear in the backported sites list.
		return null;
	}

	return (
		<>
			<OptInWelcome tracksContext="sites" />
			{ isRestoringAccount && (
				<RestoringSitesNotices
					onClose={ () =>
						navigate( {
							search: {
								...currentSearchParams,
								restored: undefined,
							},
							replace: true,
						} )
					}
				/>
			) }
		</>
	);
};
