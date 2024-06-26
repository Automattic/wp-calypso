import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Banner from 'calypso/components/banner';
import getP2HubBlogId from 'calypso/state/selectors/get-p2-hub-blog-id';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import { getSiteSlug, getSiteTitle } from 'calypso/state/sites/selectors';

import './style.scss';

const P2TeamBanner = ( { site, context } ) => {
	const translate = useTranslate();

	const isP2HubSite = useSelector( ( state ) => isSiteP2Hub( state, site?.ID ) );
	const hubId = useSelector( ( state ) => getP2HubBlogId( state, site?.ID ) );
	const hubName = useSelector( ( state ) => getSiteTitle( state, hubId ) );
	const hubSlug = useSelector( ( state ) => getSiteSlug( state, hubId ) );

	if ( isP2HubSite ) {
		if ( 'invite' === context ) {
			return (
				<Banner
					title={ translate(
						'New workspace members will be able to access all the P2s in this workspace'
					) }
					description={ translate(
						'You can also invite people to specific P2s so they join as guests.'
					) }
					callToAction={ translate( 'Learn more' ) }
					onClick={ () =>
						window.open(
							'https://p2help.wordpress.com/managing-a-p2/managing-people/inviting-team-members/',
							'_blank'
						)
					}
					disableHref
					showIcon={ false }
					className="p2-team-banner p2-team-banner--invite p2-banner"
				/>
			);
		}
	} else {
		switch ( context ) {
			case 'team':
				return (
					<Banner
						title={ translate( 'These are members and guests who have joined this P2' ) }
						description={ translate(
							'Manage your workspace members to view all the people in the %(workspaceName)s.',
							{
								args: {
									workspaceName: hubName,
								},
							}
						) }
						callToAction={ translate( 'Manage workspace members' ) }
						href={ `/people/team/${ hubSlug }` }
						showIcon={ false }
						className="p2-team-banner p2-team-banner--invite p2-banner"
					/>
				);
			case 'invite':
				return (
					<Banner
						title={ translate( 'You are inviting people to %(sitename)s', {
							args: {
								sitename: site.name,
							},
						} ) }
						description={ translate(
							"If they aren't already members of %(workspaceName)s they'll be invited as guests.",
							{
								args: {
									workspaceName: hubName,
								},
							}
						) }
						callToAction={ translate( 'Invite to the workspace instead' ) }
						href={ `/people/invites/${ hubSlug }` }
						showIcon={ false }
						className="p2-team-banner p2-team-banner--invite p2-banner"
					/>
				);
		}
	}

	return null;
};

export default P2TeamBanner;
