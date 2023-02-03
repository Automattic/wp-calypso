import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import DocumentHead from 'calypso/components/data/document-head';
import { getSiteFragment } from 'calypso/lib/route';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import EditTeamMember from './edit-team-member-form';
import InvitePeople from './invite-people';
import PeopleList from './main';
import PeopleAddSubscribers from './people-add-subscribers';
import PeopleInviteDetails from './people-invite-details';
import PeopleInvites from './people-invites';
import SubscriberDetails from './subscriber-details';
import SubscribersTeam from './subscribers-team';
import TeamInvite from './team-invite';
import ViewerDetails from './viewer-details';

export default {
	redirectToTeam,

	enforceSiteEnding( context, next ) {
		const siteId = getSiteFragment( context.path );

		if ( ! siteId ) {
			redirectToTeam( context );
		}

		next();
	},

	people( context, next ) {
		renderPeopleList( context, next );
	},

	invitePeople( context, next ) {
		renderInvitePeople( context, next );
	},

	person( context, next ) {
		renderSingleTeamMember( context, next );
	},

	peopleInvites( context, next ) {
		renderPeopleInvites( context, next );
	},

	peopleInviteDetails( context, next ) {
		renderPeopleInviteDetails( context, next );
	},

	teamMembers( context, next ) {
		renderTeamMembers( context, next );
	},

	viewerTeamMember( context, next ) {
		renderViewerTeamMember( context, next );
	},

	subscribers( context, next ) {
		renderSubscribers( context, next );
	},

	subscriberDetails( context, next ) {
		renderSubscribersDetails( context, next );
	},

	peopleAddSubscribers( context, next ) {
		renderPeopleAddSubscribers( context, next );
	},
};

function redirectToTeam( context ) {
	if ( context ) {
		// if we are redirecting we need to retain our intended layout-focus
		const currentLayoutFocus = getCurrentLayoutFocus( context.store.getState() );
		context.store.dispatch( setNextLayoutFocus( currentLayoutFocus ) );
	}
	page.redirect( '/people/team' );
}

function renderPeopleList( context, next ) {
	const PeopleListTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Users', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<PeopleListTitle />
			{ ! isEnabled( 'user-management-revamp' ) && (
				<PeopleList filter={ context.params.filter } search={ context.query.s } />
			) }
			{ isEnabled( 'user-management-revamp' ) && (
				<SubscribersTeam filter={ context.params.filter } search={ context.query.s } />
			) }
		</>
	);
	next();
}

function renderInvitePeople( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	const InvitePeopleTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Invite People', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<InvitePeopleTitle />
			{ ! isEnabled( 'user-management-revamp' ) && <InvitePeople key={ site.ID } site={ site } /> }
			{ isEnabled( 'user-management-revamp' ) && <TeamInvite key={ site.ID } site={ site } /> }
		</>
	);
	next();
}

function renderPeopleInvites( context, next ) {
	const PeopleInvitesTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Invites', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<PeopleInvitesTitle />
			<PeopleInvites />
		</>
	);
	next();
}

function renderTeamMembers( context, next ) {
	const TeamMembersTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Team Members', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<TeamMembersTitle />
			<SubscribersTeam filter={ context.params.filter } search={ context.query.s } />
		</>
	);
	next();
}

function renderSubscribers( context, next ) {
	const SubscribersTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Subscribers', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<SubscribersTitle />
			<SubscribersTeam filter={ context.params.filter } search={ context.query.s } />
		</>
	);
	next();
}

function renderSubscribersDetails( context, next ) {
	const SubscriberDetailsTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'User Details', { textOnly: true } ) } />;
	};

	// typeId is in the format "{type}-{id}
	const [ type, id ] = context.params.typeId.split( '-' );

	context.primary = (
		<>
			<SubscriberDetailsTitle />
			<SubscriberDetails subscriberId={ id } subscriberType={ type } />
		</>
	);
	next();
}

function renderPeopleAddSubscribers( context, next ) {
	const PeopleAddSubscribersTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Add Subscribers', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<PeopleAddSubscribersTitle />
			<PeopleAddSubscribers />
		</>
	);
	next();
}

function renderPeopleInviteDetails( context, next ) {
	const PeopleInviteDetailsTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'User Details', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<PeopleInviteDetailsTitle />
			<PeopleInviteDetails inviteKey={ context.params.invite_key } />
		</>
	);
	next();
}

function renderSingleTeamMember( context, next ) {
	const SingleTeamMemberTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'View Team Member', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<SingleTeamMemberTitle />
			<EditTeamMember userLogin={ context.params.user_login } />
		</>
	);
	next();
}

function renderViewerTeamMember( context, next ) {
	const SingleTeamMemberTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'View Team Member', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<SingleTeamMemberTitle />
			<ViewerDetails userId={ context.params.user_id } />
		</>
	);

	next();
}
