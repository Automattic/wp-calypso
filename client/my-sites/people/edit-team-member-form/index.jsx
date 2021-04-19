/**
 * External dependencies
 */

import React from 'react';
import page from 'page';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import HeaderCake from 'calypso/components/header-cake';
import { Card } from '@automattic/components';
import PeopleProfile from 'calypso/my-sites/people/people-profile';
import { useProtectForm } from 'calypso/lib/protect-form';
import DeleteUser from 'calypso/my-sites/people/delete-user';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { isJetpackSiteMultiSite, isJetpackSite } from 'calypso/state/sites/selectors';
import EditUserForm from './edit-user-form';
import { recordGoogleEvent as recordGoogleEventAction } from 'calypso/state/analytics/actions';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import useUserQuery from 'calypso/data/users/use-user-query';

/**
 * Style dependencies
 */
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

	const { markChanged, markSaved } = useProtectForm( `edit-${ siteId }-${ userLogin }` );
	const { data: user, error, isLoading } = useUserQuery( siteId, userLogin, { retry: false } );

	React.useEffect( () => {
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
