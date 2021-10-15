import { Card } from '@automattic/components';
import page from 'page';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import useUserQuery from 'calypso/data/users/use-user-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useProtectForm } from 'calypso/lib/protect-form';
import DeleteUser from 'calypso/my-sites/people/delete-user';
import PeopleProfile from 'calypso/my-sites/people/people-profile';
import { recordGoogleEvent as recordGoogleEventAction } from 'calypso/state/analytics/actions';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import { isJetpackSiteMultiSite, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
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
} ) => {
	const goBack = () => {
		recordGoogleEvent( 'People', 'Clicked Back Button on User Edit' );
		if ( previousRoute ) {
			page.back( previousRoute );
			return;
		}
		if ( siteSlug ) {
			page( '/people/team/' + siteSlug );
			return;
		}
		page( '/people/team' );
	};

	const { markChanged, markSaved } = useProtectForm();
	const { data: user, error, isLoading } = useUserQuery( siteId, userLogin, { retry: false } );

	useEffect( () => {
		! isLoading && error && page.redirect( `/people/team/${ siteSlug }` );
	}, [ error, isLoading, siteSlug ] );

	return (
		<Main className="edit-team-member-form">
			<PageViewTracker path="people/edit/:site/:user" title="People > View Team Member" />
			<HeaderCake onClick={ goBack } isCompact />
			<Card className="edit-team-member-form__user-profile">
				<PeopleProfile siteId={ siteId } user={ user } />
				{ user && (
					<EditUserForm
						user={ user }
						disabled={ false } // @TODO added when added mutation to remove user
						siteId={ siteId }
						isJetpack={ isJetpack }
						markChanged={ markChanged }
						markSaved={ markSaved }
						forceSync
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

		return {
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
			isJetpack: isJetpackSite( state, siteId ),
			isMultisite: isJetpackSiteMultiSite( state, siteId ),
			previousRoute: getPreviousRoute( state ),
		};
	},
	{ recordGoogleEvent: recordGoogleEventAction }
)( EditTeamMemberForm );
