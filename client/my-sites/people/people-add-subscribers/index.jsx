import { isEnabled } from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { AddSubscriberForm } from '@automattic/subscriber';
import { localize } from 'i18n-calypso';
import { get, defer } from 'lodash';
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
import { successNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleSectionAddNav from '../people-section-add-nav';

class PeopleInvites extends PureComponent {
	static propTypes = {
		site: PropTypes.object,
	};

	goBack = () => {
		const siteSlug = get( this.props, 'site.slug' );
		let fallback = siteSlug ? '/people/team/' + siteSlug : '/people/team';

		if ( isEnabled( 'user-management-revamp' ) ) {
			fallback = '/people/subscribers/' + siteSlug;
			page.redirect( fallback );
		} else {
			// Go back to last route with /people/team/$site as the fallback
			page.back( fallback );
		}
	};

	render() {
		const { site, canViewPeople, translate } = this.props;
		const siteId = site && site.ID;
		const isSiteOnFreePlan = site && site.plan.is_free;

		if ( siteId && ! canViewPeople ) {
			return (
				<Main>
					<PageViewTracker
						path="/people/add-subscribers/:site_id"
						title="People > Add Subscribers"
					/>
					<HeaderCake onClick={ this.goBack }>
						{ translate( 'Add subscribers to %(sitename)s', {
							args: {
								sitename: site.name,
							},
						} ) }
					</HeaderCake>
					{ isEnabled( 'user-management-revamp' ) && (
						<PeopleSectionAddNav selectedFilter="subscribers" />
					) }
					<EmptyContent
						title={ translate( 'You are not authorized to view this page' ) }
						illustration="/calypso/images/illustrations/illustration-404.svg"
					/>
				</Main>
			);
		}

		return (
			<Main>
				<PageViewTracker path="/people/add-subscribers/:site_id" title="People > Add Subscribers" />
				<HeaderCake isCompact={ ! isEnabled( 'user-management-revamp' ) } onClick={ this.goBack }>
					{ translate( 'Add subscribers to %(sitename)s', {
						args: {
							sitename: site.name,
						},
					} ) }
				</HeaderCake>
				{ isEnabled( 'user-management-revamp' ) && (
					<PeopleSectionAddNav selectedFilter="subscribers" />
				) }
				<Card>
					<EmailVerificationGate
						noticeText={ this.props.translate( 'You must verify your email to add subscribers.' ) }
						noticeStatus="is-info"
					>
						<AddSubscriberForm
							siteId={ this.props.site.ID }
							isSiteOnFreePlan={ isSiteOnFreePlan }
							flowName="people"
							showTitle={ false }
							showFormManualListLabel={ true }
							showCsvUpload={ isEnabled( 'subscriber-csv-upload' ) }
							submitBtnAlwaysEnable={ true }
							recordTracksEvent={ recordTracksEvent }
							onImportFinished={ () => {
								defer( () => {
									this.props.successNotice(
										this.props.translate(
											'Your subscriber list is being processed. Please check your email for status.'
										)
									);
								} );
							} }
						/>
					</EmailVerificationGate>
				</Card>
			</Main>
		);
	}
}

export default connect(
	( state ) => {
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
	},
	{
		successNotice: successNotice,
	}
)( localize( PeopleInvites ) );
