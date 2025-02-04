import page from '@automattic/calypso-router';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Gravatar from 'calypso/components/gravatar';
import InfoPopover from 'calypso/components/info-popover';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useExternalContributorsQuery from 'calypso/data/external-contributors/use-external-contributors';
import useP2GuestsQuery from 'calypso/data/p2/use-p2-guests-query';
import { decodeEntities } from 'calypso/lib/formatting';
import getWpcomFollowerRole from 'calypso/lib/get-wpcom-follower-role';
import { recordTrack } from 'calypso/reader/stats';
import isPrivateSite from 'calypso/state/selectors/is-private-site';

import './style.scss';

const PeopleProfile = ( { siteId, type, user, invite, showDate, showRole = true } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const { data: externalContributors } = useExternalContributorsQuery( siteId );
	const { data: p2Guests } = useP2GuestsQuery( siteId );

	const isPrivate = useSelector( ( state ) => isPrivateSite( state, siteId ) );

	const getRole = () => {
		const wpcomFollowerRole = getWpcomFollowerRole( isPrivate, translate );

		if ( invite && invite.role ) {
			if ( 'follower' === invite.role && wpcomFollowerRole ) {
				return wpcomFollowerRole.display_name?.toLowerCase();
			}

			return invite.role;
		}

		if ( ! user ) {
			return 'subscriber';
		}

		if ( user && user.roles && user.roles[ 0 ] ) {
			return user.roles[ 0 ];
		}

		return;
	};

	const getRoleBadgeText = ( role = getRole() ) => {
		let text;
		switch ( role ) {
			case 'super admin':
				text = translate( 'Super Admin', {
					context: 'Noun: A user role displayed in a badge',
				} );
				break;
			case 'administrator':
				text = translate( 'Admin', {
					context: 'Noun: A user role displayed in a badge',
				} );
				break;
			case 'editor':
				text = translate( 'Editor', {
					context: 'Noun: A user role displayed in a badge',
				} );
				break;
			case 'author':
				text = translate( 'Author', {
					context: 'Noun: A user role displayed in a badge',
				} );
				break;
			case 'contributor':
				text = translate( 'Contributor', {
					context: 'Noun: A user role displayed in a badge',
				} );
				break;
			case 'subscriber':
				text = translate( 'Viewer', {
					context: 'Noun: A user role displayed in a badge',
				} );
				break;
			case 'follower':
				text = translate( 'Follower' );
				break;
			case 'viewer':
				text = translate( 'Viewer' );
				break;
			case 'shop_manager':
				text = translate( 'Shop manager' );
				break;
			case 'customer':
				text = translate( 'Customer' );
				break;
			default:
				text = role;
		}

		return text;
	};

	const getRoleBadgeClass = ( role = getRole() ) => {
		return 'role-' + role;
	};

	const handleLinkToReaderSiteStream = ( event ) => {
		const modifierPressed =
			event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

		recordTrack( 'calypso_sites_people_followers_link_click', {
			modifier_pressed: modifierPressed,
		} );

		if ( modifierPressed ) {
			return;
		}

		const blogId = get( user, 'follow_data.params.blog_id', false );

		if ( ! blogId ) {
			return;
		}

		event.preventDefault();
		page( `/reader/blogs/${ blogId }` );
	};

	const renderNameOrEmail = () => {
		let name;
		let userTitle = null;
		if ( ! user ) {
			name = translate( 'Loading Users', {
				context: 'Placeholder text while fetching users.',
			} );
		} else if ( user.name ) {
			name = user.name;
		} else if ( user.label ) {
			name = user.label;
		} else if ( 'invite' === type || 'invite-details' === type ) {
			// If an invite was sent to a WP.com user, the invite object will have
			// either a display name (if set) or the WP.com username. Invites can
			// also be sent to any email address, in which case the other details
			// will not be set and we therefore display the user's email.
			name = user.login || user.email;
			if ( ! user.login ) {
				// Long email addresses may not show fully in the space provided.
				userTitle = user.email;
			}
		}

		if ( ! name ) {
			return null;
		}

		const blogId = get( user, 'follow_data.params.blog_id', false );

		return (
			<div className="people-profile__username" title={ userTitle }>
				{ blogId ? (
					<a href={ user.url } onClick={ handleLinkToReaderSiteStream }>
						{ decodeEntities( name ) }
					</a>
				) : (
					decodeEntities( name )
				) }
			</div>
		);
	};

	const renderLogin = () => {
		let login;
		if ( ! user ) {
			login = translate( 'Loading Users', {
				context: 'Placeholder text while fetching users.',
			} );
		} else if ( user.login ) {
			login = user.login;
		}

		if ( login ) {
			login = (
				<div className="people-profile__login" data-e2e-login={ login }>
					<span>@{ login }</span>
				</div>
			);
		}

		return login;
	};

	const renderRole = () => {
		let contractorBadge;
		let superAdminBadge;
		let roleBadge;
		let p2GuestBadge;

		if ( user && user.is_super_admin ) {
			superAdminBadge = (
				<div className="people-profile__role-badge role-super-admin">
					{ getRoleBadgeText( 'super admin' ) }
				</div>
			);
		}

		if ( getRole() ) {
			roleBadge = (
				<div className={ clsx( 'people-profile__role-badge', getRoleBadgeClass() ) }>
					{ getRoleBadgeText() }
				</div>
			);
		}

		if (
			externalContributors &&
			externalContributors.includes( user?.linked_user_ID ?? user?.ID )
		) {
			contractorBadge = (
				<>
					<div className="people-profile__role-badge role-contractor">
						{ translate( 'Contractor', {
							context: 'Noun: A user role',
						} ) }
					</div>
					<div className="people-profile__role-badge-info">
						<InfoPopover position="top right">
							{ translate( 'This user is a freelancer, consultant, or agency.' ) }
						</InfoPopover>
					</div>
				</>
			);
		}
		if ( p2Guests?.guests && p2Guests.guests.includes( user?.linked_user_ID ?? user?.ID ) ) {
			p2GuestBadge = (
				<>
					<div className="people-profile__role-badge role-p2-guest">{ translate( 'Guest' ) }</div>
					<div className="people-profile__role-badge-info">
						<InfoPopover position="top right">
							{ translate(
								'This user is a member of this P2 as a guest, but not a member of the workspace.'
							) }
						</InfoPopover>
					</div>
				</>
			);
		}

		if ( ! roleBadge && ! superAdminBadge && ! contractorBadge && ! p2GuestBadge ) {
			return;
		}

		return (
			<div className="people-profile__badges">
				{ superAdminBadge }
				{ roleBadge }
				{ contractorBadge }
				{ p2GuestBadge }
			</div>
		);
	};

	const renderSubscribedDate = () => {
		if ( ! user || ! user.date_subscribed ) {
			return;
		}

		return (
			<div className="people-profile__subscribed">
				{ translate( 'Since %(formattedDate)s', {
					context: 'How long a user has been subscribed to a blog. Example: "Since Sep 16, 2015"',
					args: {
						formattedDate: moment( user.date_subscribed ).format( 'll' ),
					},
				} ) }
			</div>
		);
	};

	const renderSubscribedRole = () => {
		if ( ! user || ! user.date_subscribed ) {
			return null;
		}

		return (
			<div className="people-profile__badges">
				<div className={ clsx( 'people-profile__role-badge', getRoleBadgeClass( 'subscriber' ) ) }>
					{ user.login && translate( 'Follower' ) }
					{ ! user.login && translate( 'Email subscriber' ) }
				</div>
			</div>
		);
	};

	const renderViewerRole = () => {
		const role = 'viewer';
		return (
			<div className="people-profile__badges">
				<div className={ clsx( 'people-profile__role-badge', getRoleBadgeClass( role ) ) }>
					{ getRoleBadgeText( role ) }
				</div>
			</div>
		);
	};

	const isFollowerType = () => {
		return user && ! user.roles && user.date_subscribed;
	};

	const classes = clsx( 'people-profile', {
		'is-placeholder': ! user,
	} );

	return (
		<div className={ classes }>
			<div className="people-profile__gravatar">
				<Gravatar user={ user } size={ 72 } />
			</div>
			<div className="people-profile__detail">
				{ renderNameOrEmail() }
				{ renderLogin() }
				{ showDate && renderSubscribedDate() }
				{ showRole && isFollowerType() ? renderSubscribedRole() : renderRole() }
				{ type === 'viewer' && renderViewerRole() }
			</div>
		</div>
	);
};

PeopleProfile.propType = {
	siteId: PropTypes.number.isRequired,
	user: PropTypes.object,
	type: PropTypes.string,
	invite: PropTypes.object,
};

export default PeopleProfile;
