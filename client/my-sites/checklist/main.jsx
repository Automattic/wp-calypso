/** @format */
/**
 * External dependencies
 */
import page from 'page';
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { find, some } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ChecklistShow from './checklist-show';
import ChecklistShowShare from './share';
import config from 'config';
import DocumentHead from 'components/data/document-head';
import EmptyContent from 'components/empty-content';
import FormattedHeader from 'components/formatted-header';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, isNewSite, getSiteSlug } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import isSiteOnFreePlan from 'state/selectors/is-site-on-free-plan';

class ChecklistMain extends PureComponent {
	componentDidMount() {
		this.maybeRedirectJetpack();
	}

	componentDidUpdate( prevProps ) {
		this.maybeRedirectJetpack( prevProps );
	}

	/**
	 * Redirect Jetpack checklists to /plans/my-plan/:siteSlug
	 *
	 * Guard for relevant props updated and correct conditions
	 *
	 * @param {Object}   prevProps           Optional. Previous props from componentDidUpdate.
	 * @param {?boolean} prevProps.isAtomic  Previous isAtomic
	 * @param {?boolean} prevProps.isJetpack Previous isJetpack
	 * @param {?string}  prevProps.siteSlug  Previous siteSlug
	 */
	maybeRedirectJetpack( prevProps = {} ) {
		if (
			this.props.siteSlug &&
			false === this.props.isAtomic &&
			this.props.isJetpack &&
			some( [
				this.props.siteSlug !== prevProps.siteSlug,
				this.props.isAtomic !== prevProps.isAtomic,
				this.props.isJetpack !== prevProps.isJetpack,
			] )
		) {
			page.redirect( `/plans/my-plan/${ this.props.siteSlug }` );
		}
	}

	getHeaderTitle() {
		const { translate, siteHasFreePlan } = this.props;

		if ( siteHasFreePlan ) {
			return translate( 'Your site has been created!' );
		}

		return translate( 'Thank you for your purchase!' );
	}

	getSubHeaderText( displayMode ) {
		const { translate } = this.props;

		if ( displayMode === 'gsuite' ) {
			return translate(
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

		return translate(
			"Now that your site has been created, it's time to get it ready for you to share. " +
				"We've prepared a list of things that will help you get there quickly."
		);
	}

	renderHeader( completed, displayMode ) {
		const { translate, isNewlyCreatedSite } = this.props;

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
						headerText={ translate( 'Congratulations!' ) }
						subHeaderText={ translate(
							"You have completed all your tasks. Now let's tell people about it. Share your site."
						) }
					/>
					<ChecklistShowShare
						className="checklist__share"
						siteSlug={ this.props.siteSlug }
						recordTracksEvent={ this.props.recordTracksEvent }
					/>
				</Fragment>
			);
		}

		if ( isNewlyCreatedSite ) {
			return (
				<Fragment>
					<img
						src="/calypso/images/signup/confetti.svg"
						aria-hidden="true"
						className="checklist__confetti"
						alt=""
					/>
					<FormattedHeader
						headerText={ this.getHeaderTitle() }
						subHeaderText={ this.getSubHeaderText( displayMode ) }
					/>
				</Fragment>
			);
		}

		return (
			<FormattedHeader
				headerText={ translate( 'Welcome back!' ) }
				subHeaderText={ translate(
					'Let’s get your site ready for its debut with a few quick setup steps.'
				) }
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

		let translatedTitle = translate( 'Site Checklist' );
		let title = 'Site Checklist';
		let path = '/checklist/:site';
		if ( displayMode ) {
			translatedTitle = translate( 'Thank You' );
			title = 'Thank You';
			path += `?d=${ displayMode }`;
		}

		return (
			<Main className="checklist">
				<PageViewTracker path={ path } title={ title } />
				<SidebarNavigation />
				<DocumentHead title={ translatedTitle } />
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
	const siteHasFreePlan = isSiteOnFreePlan( state, siteId );
	const isAtomic = isSiteAutomatedTransfer( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
	const isNewlyCreatedSite = isNewSite( state, siteId );
	return {
		checklistAvailable: ! isAtomic && ( config.isEnabled( 'jetpack/checklist' ) || ! isJetpack ),
		isAtomic,
		isJetpack,
		isNewlyCreatedSite,
		siteId,
		siteSlug,
		siteHasFreePlan,
		user: getCurrentUser( state ),
	};
};

export default connect(
	mapStateToProps,
	{ recordTracksEvent }
)( localize( ChecklistMain ) );
