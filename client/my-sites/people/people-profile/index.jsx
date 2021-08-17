/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { get } from 'lodash';
import { recordTrack } from 'calypso/reader/stats';
import page from 'page';
import { decodeEntities } from 'calypso/lib/formatting';
import { useEffect, useState } from '@wordpress/element';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Gravatar from 'calypso/components/gravatar';
import InfoPopover from 'calypso/components/info-popover';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import useExternalContributorsQuery from 'calypso/data/external-contributors/use-external-contributors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const PeopleProfile = ( { siteId, type, user, invite, moment, translate } ) => {
	const [ isExternalContributor, setIsExternalContributor ] = useState( false );
	const { data: externalContributors } = useExternalContributorsQuery( siteId );

	useEffect( () => {
		if (
			externalContributors &&
			user?.ID &&
			externalContributors.includes( user?.linked_user_ID ?? user.ID )
		) {
			setIsExternalContributor( true );
		}
	}, [ user, externalContributors ] );

	const getRole = () => {
		if ( invite && invite.role ) {
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

	const getRoleBadgeText = ( role ) => {
		let text;
		role = 'undefined' === typeof role ? getRole() : role;

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
				text = translate( 'Subscriber', {
					context: 'Noun: A user role displayed in a badge',
				} );
				break;
			case 'follower':
				text = translate( 'Follower' );
				break;
			default:
				text = role;
		}

		return text;
	};

	const getRoleBadgeClass = ( role ) => {
		role = 'undefined' === typeof role ? getRole() : role;
		return 'role-' + role;
	};

	const handleLinkToReaderSiteStream = ( event ) => {
		const modifierPressed =
			event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey;

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
		page( `/read/blogs/${ blogId }` );
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

		if ( user && user.is_super_admin ) {
			superAdminBadge = (
				<div className="people-profile__role-badge role-super-admin">
					{ getRoleBadgeText( 'super admin' ) }
				</div>
			);
		}

		if ( getRole() ) {
			roleBadge = (
				<div className={ classNames( 'people-profile__role-badge', getRoleBadgeClass() ) }>
					{ getRoleBadgeText() }
				</div>
			);
		}

		if ( isExternalContributor ) {
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

		if ( ! roleBadge && ! superAdminBadge && ! contractorBadge ) {
			return;
		}

		return (
			<div className="people-profile__badges">
				{ superAdminBadge }
				{ roleBadge }
				{ contractorBadge }
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

	const isFollowerType = () => {
		return user && ! user.roles && user.date_subscribed;
	};

	const classes = classNames( 'people-profile', {
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
				{ isFollowerType() ? renderSubscribedDate() : renderRole() }
			</div>
		</div>
	);
};

PeopleProfile.propType = {
	siteId: PropTypes.number.isRequired,
	translate: PropTypes.func.isRequired,
	moment: PropTypes.func.isRequired,
	user: PropTypes.object,
	type: PropTypes.string,
	invite: PropTypes.object,
};

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	return {
		...ownProps,
		siteId,
	};
} )( localize( withLocalizedMoment( PeopleProfile ) ) );
