/** @format */

/**
 * External dependencies
 */
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import EmptyContent from 'components/empty-content';
import FormattedHeader from 'components/formatted-header';
import ChecklistShow from './checklist-show';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { isJetpackSite, getSiteSlug } from 'state/sites/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { recordTracksEvent } from 'state/analytics/actions';
import { createNotice } from 'state/notices/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import ChecklistShowShare from './share';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';

class ChecklistMain extends PureComponent {
	getHeaderTitle( displayMode ) {
		if ( displayMode === 'free' ) {
			return 'Your site has been created!';
		}

		return 'Thank you for your purchase!';
	}

	getSubHeaderText( displayMode ) {
		if ( displayMode === 'gsuite' ) {
			return this.props.translate(
				'We emailed %(email)s with instructions to complete your G Suite setup. ' +
					'In the mean time, let’s get your new site ready for you to share. ' +
					'We’ve prepared a list of things that will help you get there quickly.',
				{
					args: {
						email: this.props.user.email,
					},
				}
			);
		}

		return (
			"Now that your site has been created, it's time to get it ready for you to share. " +
			"We've prepared a list of things that will help you get there quickly."
		);
	}

	renderHeader( completed, displayMode ) {
		if ( completed ) {
			return (
				<Fragment>
					<img
						src="/calypso/images/signup/confetti.svg"
						aria-hidden="true"
						className="checklist__confetti"
						alt=""
					/>
					<FormattedHeader
						headerText="Congratulations!"
						subHeaderText="You have completed all your tasks. Now let's tell people about it. Share your site."
					/>
					<ChecklistShowShare
						className="checklist__share"
						siteSlug={ this.props.siteSlug }
						recordTracksEvent={ this.props.track }
					/>
				</Fragment>
			);
		}

		if ( displayMode ) {
			return (
				<Fragment>
					<img
						src="/calypso/images/signup/confetti.svg"
						aria-hidden="true"
						className="checklist__confetti"
						alt=""
					/>
					<FormattedHeader
						headerText={ this.getHeaderTitle( displayMode ) }
						subHeaderText={ this.getSubHeaderText( displayMode ) }
					/>
				</Fragment>
			);
		}

		return (
			<FormattedHeader
				headerText="Welcome back!"
				subHeaderText="Let’s get your site ready for its debut with a few quick setup steps."
			/>
		);
	}

	renderChecklist() {
		const { displayMode, siteId, tasks } = this.props;
		const completed = tasks && ! find( tasks, { completed: false } );

		return (
			<Fragment>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ this.renderHeader( completed, displayMode ) }
				<ChecklistShow />
			</Fragment>
		);
	}

	render() {
		const { checklistAvailable, displayMode, translate } = this.props;

		let title = 'Site Checklist';
		let path = '/checklist/:site';
		if ( displayMode ) {
			title = 'Thank You';
			path += `?d=${ displayMode }`;
		}

		return (
			<Main className="checklist">
				<PageViewTracker path={ path } title={ title } />
				<SidebarNavigation />
				<DocumentHead title={ title } />
				{ checklistAvailable ? (
					this.renderChecklist()
				) : (
					<EmptyContent title={ translate( 'Checklist not available for this site' ) } />
				) }
			</Main>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	const isAtomic = isSiteAutomatedTransfer( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
	return {
		checklistAvailable: ! isAtomic && ( config.isEnabled( 'jetpack/checklist' ) || ! isJetpack ),
		siteId,
		siteSlug,
		user: getCurrentUser( state ),
	};
};

const mapDispatchToProps = {
	track: recordTracksEvent,
	notify: createNotice,
	requestTour: requestGuidedTour,
	update: requestSiteChecklistTaskUpdate,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( ChecklistMain ) );
