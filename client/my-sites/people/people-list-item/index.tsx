import { Button, CompactCard } from '@automattic/components';
import { useSendInvites } from '@automattic/data-stores';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { get } from 'lodash';
import React from 'react';
import { getRole } from 'calypso/blocks/importer/wordpress/import-everything/import-users/utils';
import PeopleProfile from 'calypso/my-sites/people/people-profile';
import { useDispatch, useSelector } from 'calypso/state';
import { recordGoogleEvent, composeAnalytics } from 'calypso/state/analytics/actions';
import { requestSiteInvites } from 'calypso/state/invites/actions';
import { didInviteDeletionSucceed } from 'calypso/state/invites/selectors';
import { createNotice, removeNotice } from 'calypso/state/notices/actions';
import { NoticeStatus } from 'calypso/state/notices/types';
import { AppState } from 'calypso/types';
import { Invite } from '../team-invites/types';
import type { Member, SiteDetails } from '@automattic/data-stores';
import './style.scss';

interface PeopleListItemProps {
	site?: SiteDetails | null;
	invite?: Invite;
	clickableItem?: boolean;
	user?: Member;
	isSelectable?: boolean;
	onRemove?: () => void;
	type?: string;
}

interface sendInvitesResponse {
	success: boolean;
	errors: Array< string >;
	email_or_username: string;
}

const PeopleListItem: React.FC< PeopleListItemProps > = ( {
	site,
	invite,
	user,
	isSelectable,
	onRemove,
	type,
	clickableItem = true,
}: PeopleListItemProps ) => {
	const siteId = site && site?.ID;
	const inviteKey = invite?.key;
	const dispatch = useDispatch();
	const translate = useTranslate();

	const inviteWasDeleted = useSelector( ( state: AppState ) => {
		return siteId && inviteKey && didInviteDeletionSucceed( state, siteId, inviteKey );
	} );

	const { isPending: isSubmittingInvites, mutateAsync: sendInvites } = useSendInvites(
		siteId as number
	);

	const navigateToUser = () => {
		window.scrollTo( 0, 0 );
		dispatch(
			composeAnalytics( recordGoogleEvent( 'People', 'Clicked User Profile From Team List' ) )
		);
	};

	const userHasPromoteCapability = () => {
		return site && site.capabilities && site.capabilities.promote_users;
	};

	const canLinkToProfile = () => {
		return user && user.roles && site && site.slug && userHasPromoteCapability() && ! isSelectable;
	};

	const canLinkToSubscriberProfile = () => {
		return site && site.slug && user && user.ID;
	};

	const canReceiveInvite = () => {
		return (
			user &&
			user.roles &&
			user.email &&
			! user.linked_user_ID &&
			site &&
			site.slug &&
			! isSelectable
		);
	};

	const displayNotice = (
		message: string,
		noticeType: NoticeStatus = 'is-success',
		duration: undefined | number | null = 3000,
		additionalOptions: { button?: string; id?: string; onClick?: () => void } = {}
	) => {
		const { notice } = dispatch(
			createNotice( noticeType, message, { duration, ...additionalOptions } )
		);
		return {
			removeNotice: () => dispatch( removeNotice( notice.noticeId ) ),
		};
	};

	const onSendInvite = async ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		// Prevents navigation to invite-details screen and onClick event.
		event.preventDefault();
		event.stopPropagation();

		if ( isSubmittingInvites || ! user || ! user.roles ) {
			return null;
		}
		const { email } = user;
		const userRoles = getRole( user );
		const response = ( await sendInvites( [
			{ email_or_username: email as string, role: userRoles },
		] ) ) as [ sendInvitesResponse ];

		const success = response && response[ 0 ].success;
		if ( success && siteId ) {
			dispatch( requestSiteInvites( siteId ) );
			displayNotice( translate( 'Invitation sent successfully' ) );
			dispatch(
				composeAnalytics(
					recordGoogleEvent( 'calypso_sso_user_invite_success', { siteId: siteId } )
				)
			);
		}
	};

	const renderInviteButton = () => {
		return (
			<div className="people-list-item__invite-status">
				<Button
					busy={ isSubmittingInvites }
					className="people-list-item__invite-send"
					onClick={ onSendInvite }
				>
					{ translate( 'Invite' ) }
				</Button>
			</div>
		);
	};

	const maybeGetCardLink = () => {
		if ( ! clickableItem ) {
			return false;
		}

		switch ( type ) {
			case 'invite-details':
				return null;

			case 'invite':
				return invite && `/people/invites/${ site?.slug }/${ invite.key }`;

			case 'subscriber-details': {
				const subscriberType = user?.login ? 'wpcom' : 'email';

				return (
					canLinkToSubscriberProfile() &&
					`/people/subscribers/${ site?.slug }/${ subscriberType }-${ user?.ID }`
				);
			}

			case 'viewer':
				return `/people/viewers/${ site?.slug }/${ user?.ID }`;

			default:
				return canLinkToProfile() && `/people/edit/${ site?.slug }/${ user?.login }`;
		}
	};

	const isInvite = invite && ( 'invite' === type || 'invite-details' === type );

	if ( isInvite && inviteWasDeleted ) {
		// After an invite is deleted and the user is returned to the
		// invites list, the invite can occasionally reappear in the next
		// API call, so we need to check for this situation and avoid
		// rendering an invite that we know is actually deleted.
		return null;
	}

	const classes = classNames( 'people-list-item', {
		'is-invite': isInvite,
		'is-invite-details': type === 'invite-details',
	} );

	const tagName = canLinkToProfile() ? 'a' : 'span';
	const inviteButton = renderInviteButton();

	return (
		<CompactCard
			className={ classes }
			tagName={ tagName }
			href={ maybeGetCardLink() }
			onClick={ canLinkToProfile() && navigateToUser }
		>
			<div className="people-list-item__profile-container">
				<PeopleProfile
					invite={ invite }
					siteId={ siteId }
					type={ type }
					user={ user }
					showDate={ ! maybeGetCardLink() }
					showRole={ !! maybeGetCardLink() }
				/>
			</div>
			{ canReceiveInvite() && ! isInvite && inviteButton }
			{ onRemove && (
				<div className="people-list-item__actions">
					<Button
						className="people-list-item__remove-button"
						onClick={ onRemove }
						data-e2e-remove-login={ get( user, 'login', '' ) }
					>
						<span>
							{ translate( 'Remove', {
								context: 'Verb: Remove a user or follower from the blog.',
							} ) }
						</span>
					</Button>
				</div>
			) }
		</CompactCard>
	);
};

export default PeopleListItem;
