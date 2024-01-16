import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { getSiteFragment } from 'calypso/lib/route';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import CreatePeople from './create-people';
import EditTeamMember from './edit-team-member-form';
import InvitePeople from './invite-people';
import PeopleList from './main';
import PeopleInviteDetails from './people-invite-details';
import PeopleInvites from './people-invites';
import PeopleInvitesPending from './people-invites-pending';
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

	createPeople( context, next ) {
		renderCreatePeople( context, next );
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

	peoplePendingInvites( context, next ) {
		renderPendingInvites( context, next );
	},

	teamMembers( context, next ) {
		renderTeamMembers( context, next );
	},

	viewerTeamMember( context, next ) {
		renderViewerTeamMember( context, next );
	},

	subscribers( context ) {
		// Redirect to the new Subscribers page
		const state = context.store.getState();
		const siteSlug = getSelectedSiteSlug( state );
		const redirectURL = '/subscribers/' + ( siteSlug ? siteSlug : '' );
		page.redirect( redirectURL );
	},

	subscriberDetails( context, next ) {
		renderSubscribersDetails( context, next );
	},

	peopleAddSubscribers( context ) {
		// Redirect to the new Subscribers page
		const state = context.store.getState();
		const siteSlug = getSelectedSiteSlug( state );
		const redirectURL = '/subscribers/' + ( siteSlug ? siteSlug : '' );
		page.redirect( redirectURL );
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

function renderCreatePeople( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	const CreatePeopleTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Create People', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<CreatePeopleTitle />
			<CreatePeople key={ site.ID } site={ site } />
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

function renderPendingInvites( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	const PeopleInvitesTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Pending Invites', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<PeopleInvitesTitle />
			<PeopleInvitesPending site={ site } />
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
