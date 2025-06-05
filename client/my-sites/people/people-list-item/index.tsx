import { Button, CompactCard } from '@automattic/components';
import { useSendInvites } from '@automattic/data-stores';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { get } from 'lodash';
import React from 'react';
import { userCan } from 'calypso/lib/site/utils';
import PeopleProfile from 'calypso/my-sites/people/people-profile';
import { useDispatch, useSelector } from 'calypso/state';
import { recordGoogleEvent, composeAnalytics } from 'calypso/state/analytics/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { requestSiteInvites } from 'calypso/state/invites/actions';
import { createNotice, removeNotice } from 'calypso/state/notices/actions';
import { NoticeStatus } from 'calypso/state/notices/types';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import { Invite } from '../team-invites/types';
import type { Member, SiteDetails } from '@automattic/data-stores';
import './style.scss';

export const getRole = ( user: Member ) => {
	if ( ! user ) {
		return 'subscriber';
	}

	if ( ! user.roles && user.date_subscribed ) {
		return user.login ? 'follower' : 'email-subscriber';
	}

	if ( user && user.roles && user.roles[ 0 ] ) {
		return user.roles[ 0 ];
	}

	return 'follower';
};

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
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isSimple = useSelector( isSimpleSite );

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
			! isSelectable &&
			! isSimple
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

	const handleInviteSuccess = ( siteId: number ) => {
		dispatch( requestSiteInvites( siteId ) );
		displayNotice( translate( 'Invitation sent successfully' ) );
		dispatch( recordTracksEvent( 'calypso_sso_user_invite_success', { site_id: siteId } ) );
	};

	const handleInviteError = ( siteId: number, error: unknown ) => {
		displayNotice( translate( 'The invitation sending has failed.' ), 'is-error' );
		const error_message = error instanceof Error ? error.message : 'error sending invite';
		dispatch(
			recordTracksEvent( 'calypso_sso_user_invite_error', { site_id: siteId, error_message } )
		);
	};

	const onSendInvite = async ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		// Prevents navigation to invite-details screen and onClick event.
		event.preventDefault();
		event.stopPropagation();

		if ( isSubmittingInvites || ! user || ! user.roles || ! siteId ) {
			return null;
		}
		const { email } = user;
		const userRoles = getRole( user );
		try {
			( await sendInvites( [ { email_or_username: email as string, role: userRoles } ] ) ) as [
				sendInvitesResponse,
			];
			handleInviteSuccess( siteId );
		} catch ( error ) {
			handleInviteError( siteId, error );
		}
	};

	const shouldShowInviteButton = ( isInvite: boolean | undefined ) => {
		const canSendInvite = site && userCan( 'promote_users', site );
		return canReceiveInvite() && ! isInvite && canSendInvite;
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

	const classes = clsx( 'people-list-item', {
		'is-invite': isInvite,
		'is-invite-details': type === 'invite-details',
	} );

	const tagName = canLinkToProfile() ? 'a' : 'span';

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
			{ shouldShowInviteButton( isInvite ) && renderInviteButton() }
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
