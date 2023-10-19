import { isEnabled } from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import useUserQuery from 'calypso/data/users/use-user-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useProtectForm } from 'calypso/lib/protect-form';
import DeleteUser from 'calypso/my-sites/people/delete-user';
import PeopleProfile from 'calypso/my-sites/people/people-profile';
import { recordGoogleEvent as recordGoogleEventAction } from 'calypso/state/analytics/actions';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import { isJetpackSiteMultiSite, isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import EditUserForm from './edit-user-form';

import './style.scss';

export const EditTeamMemberForm = ( {
	siteId,
	userLogin,
	isJetpack,
	isMultisite,
	previousRoute,
	siteSlug,
	recordGoogleEvent,
	translate,
} ) => {
	const goBack = () => {
		recordGoogleEvent( 'People', 'Clicked Back Button on User Edit' );

		const teamRoute = isEnabled( 'user-management-revamp' ) ? 'team-members' : 'team';

		if ( previousRoute ) {
			page.back( previousRoute );
			return;
		}
		if ( siteSlug ) {
			page( `/people/${ teamRoute }/${ siteSlug }` );
			return;
		}
		page( `/people/${ teamRoute }` );
	};

	const { markChanged, markSaved } = useProtectForm();
	const { data: user, error, isLoading } = useUserQuery( siteId, userLogin, { retry: false } );

	useEffect( () => {
		! isLoading && error && page.redirect( `/people/team/${ siteSlug }` );
	}, [ error, isLoading, siteSlug ] );

	return (
		<Main className="edit-team-member-form">
			<PageViewTracker path="people/edit/:site/:user" title="People > View Team Member" />
			{ isEnabled( 'user-management-revamp' ) && (
				<NavigationHeader
					navigationItems={ [] }
					title={ translate( 'Users' ) }
					subtitle={ translate( 'People who have subscribed to your site and team members.' ) }
				/>
			) }
			<HeaderCake onClick={ goBack } isCompact>
				{ translate( 'User Details' ) }
			</HeaderCake>
			<Card className="edit-team-member-form__user-profile">
				<PeopleProfile siteId={ siteId } user={ user } />
				{ user && (
					<EditUserForm
						user={ user }
						disabled={ false } // @TODO added when added mutation to remove user
						siteId={ siteId }
						autoSave={ isEnabled( 'user-management-revamp' ) }
						roleSelectControlType={ isEnabled( 'user-management-revamp' ) ? 'select' : 'radio' }
						isJetpack={ isJetpack }
						markChanged={ markChanged }
						markSaved={ markSaved }
					/>
				) }
			</Card>
			{ user && (
				<DeleteUser
					siteId={ siteId }
					isJetpack={ isJetpack }
					isMultisite={ isMultisite }
					user={ user }
					siteSlug={ siteSlug }
				/>
			) }
		</Main>
	);
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const site = getSelectedSite( state );

		const isJetpack = isJetpackSite( state, siteId );
		const isMultisite = isJetpack
			? isJetpackSiteMultiSite( state, siteId )
			: site && site.is_multisite;

		return {
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
			isJetpack,
			isMultisite,
			previousRoute: getPreviousRoute( state ),
		};
	},
	{ recordGoogleEvent: recordGoogleEventAction }
)( localize( EditTeamMemberForm ) );
