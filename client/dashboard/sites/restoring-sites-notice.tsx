import { Link, useNavigate } from '@tanstack/react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { sitesRoute } from '../app/router/sites';
import InlineSupportLink from '../components/inline-support-link';
import Notice from '../components/notice';

export const RestoringSitesNotices = () => {
	const navigate = useNavigate( { from: sitesRoute.fullPath } );
	const currentSearchParams = sitesRoute.useSearch();

	const handleClose = () =>
		navigate( {
			search: {
				...currentSearchParams,
				restored: undefined,
			},
			replace: true,
		} );

	return (
		<Notice title={ __( 'Choose which sites you’d like to restore' ) } onClose={ handleClose }>
			{ createInterpolateElement(
				__(
					'<deletedSitesLink>View your deleted sites</deletedSitesLink> and restore the ones you’d like to keep. You’ll also need to <invitePeopleLink>invite any users</invitePeopleLink> that previously had access to your sites.'
				),
				{
					deletedSitesLink: (
						<Link to="/sites" search={ { ...currentSearchParams, is_deleted: true } } />
					),
					invitePeopleLink: <InlineSupportLink supportContext="invite-people" />,
				}
			) }
		</Notice>
	);
};
