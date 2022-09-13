import { isEnabled } from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { AddSubscriberForm } from '@automattic/subscriber';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import EmptyContent from 'calypso/components/empty-content';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	isRequestingInvitesForSite,
	getPendingInvitesForSite,
	getAcceptedInvitesForSite,
	getNumberOfInvitesFoundForSite,
	isDeletingAnyInvite,
} from 'calypso/state/invites/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

class PeopleInvites extends PureComponent {
	static propTypes = {
		site: PropTypes.object,
	};

	goBack = () => {
		const siteSlug = get( this.props, 'site.slug' );
		const fallback = siteSlug ? '/people/team/' + siteSlug : '/people/team';

		// Go back to last route with /people/team/$site as the fallback
		page.back( fallback );
	};

	render() {
		const { site, canViewPeople, translate } = this.props;
		const siteId = site && site.ID;

		if ( siteId && ! canViewPeople ) {
			return (
				<Main>
					<PageViewTracker
						path="/people/add-subscribers/:site_id"
						title="People > Add Subscribers"
					/>
					<EmptyContent
						title={ translate( 'You are not authorized to view this page' ) }
						illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					/>
				</Main>
			);
		}

		return (
			<Main>
				<PageViewTracker path="/people/add-subscribers/:site_id" title="People > Add Subscribers" />
				<HeaderCake isCompact onClick={ this.goBack }>
					{ translate( 'Add subscribers to %(sitename)s', {
						args: {
							sitename: site.name,
						},
					} ) }
				</HeaderCake>
				<Card>
					<EmailVerificationGate
						noticeText={ this.props.translate( 'You must verify your email to add subscribers.' ) }
						noticeStatus="is-info"
					>
						<AddSubscriberForm
							siteId={ this.props.site.ID }
							flowName={ 'people' }
							showCsvUpload={ isEnabled( 'subscriber-csv-upload' ) }
							recordTracksEvent={ recordTracksEvent }
							onImportFinished={ () => {
								page.redirect( `/people/invites/${ this.props.site.slug }` );
							} }
						/>
					</EmailVerificationGate>
				</Card>
			</Main>
		);
	}
}

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	const siteId = site && site.ID;

	return {
		site,
		isJetpack: isJetpackSite( state, siteId ),
		isPrivate: isPrivateSite( state, siteId ),
		requesting: isRequestingInvitesForSite( state, siteId ),
		pendingInvites: getPendingInvitesForSite( state, siteId ),
		acceptedInvites: getAcceptedInvitesForSite( state, siteId ),
		totalInvitesFound: getNumberOfInvitesFoundForSite( state, siteId ),
		deleting: isDeletingAnyInvite( state, siteId ),
		canViewPeople: canCurrentUser( state, siteId, 'list_users' ),
	};
} )( localize( PeopleInvites ) );
