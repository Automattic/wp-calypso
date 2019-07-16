/**
 * External dependencies
 */
import page from 'page';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import WpcomChecklist from './wpcom-checklist';
import ChecklistShowShare from './share';
import GetAppsBlock from 'blocks/get-apps';

/**
 * State dependencies
 */
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import isSiteOnPaidPlan from 'state/selectors/is-site-on-paid-plan';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, isJetpackSite, isNewSite } from 'state/sites/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class ChecklistMain extends PureComponent {
	state = { complete: false };

	componentDidMount() {
		this.maybeRedirectJetpack();
	}

	componentDidUpdate( prevProps ) {
		this.maybeRedirectJetpack( prevProps );
	}

	handleCompletionUpdate = ( { complete } ) => void this.setState( { complete } );

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
			/**
			 * Only send Jetpack users to plans if a checklist will be presented. Otherwise,
			 * let the "Not available" view render.
			 */
			this.props.siteSlug &&
			false === this.props.isAtomic &&
			this.props.isJetpack &&
			( this.props.siteSlug !== prevProps.siteSlug ||
				this.props.isAtomic !== prevProps.isAtomic ||
				this.props.isJetpack !== prevProps.isJetpack )
		) {
			page.redirect( `/plans/my-plan/${ this.props.siteSlug }` );
		}
	}

	/**
	 * Get subheader text to be shown for Checklist
	 * @return {String} The translated string
	 */
	getSubHeaderText() {
		const { displayMode, translate } = this.props;

		switch ( displayMode ) {
			case 'gsuite':
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

			case 'concierge':
				return translate(
					'We emailed %(email)s with instructions to schedule your Quick Start Session call with us. ' +
						'In the mean time, let’s get your new site ready for you to share. ' +
						'We’ve prepared a list of things that will help you get there quickly.',
					{
						args: {
							email: this.props.user.email,
						},
					}
				);

			default:
				return translate(
					"Now that your site has been created, it's time to get it ready for you to share. " +
						"We've prepared a list of things that will help you get there quickly."
				);
		}
	}

	renderHeader() {
		const { isNewlyCreatedSite, translate } = this.props;
		const { complete } = this.state;

		if ( complete ) {
			return (
				<>
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
					<ChecklistShowShare className="checklist__share" siteSlug={ this.props.siteSlug } />
					<GetAppsBlock />
				</>
			);
		}

		if ( isNewlyCreatedSite ) {
			return (
				<>
					<img
						src="/calypso/images/signup/confetti.svg"
						aria-hidden="true"
						className="checklist__confetti"
						alt=""
					/>
					<FormattedHeader
						headerText={
							this.props.siteHasPaidPlan
								? translate( 'Thank you for your purchase!' )
								: translate( 'Your site has been created!' )
						}
						subHeaderText={ this.getSubHeaderText() }
					/>
				</>
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

	render() {
		// Jetpack sites (excluding Atomic) should be redirected via this.maybeRedirectJetpack
		if ( this.props.isJetpack && false === this.props.isAtomic ) {
			return null;
		}

		const { displayMode, siteId, translate } = this.props;

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
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ this.renderHeader() }
				<WpcomChecklist updateCompletion={ this.handleCompletionUpdate } viewMode="checklist" />
			</Main>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const isAtomic = isSiteAutomatedTransfer( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );

	return {
		isAtomic,
		isJetpack,
		isNewlyCreatedSite: isNewSite( state, siteId ),
		siteHasPaidPlan: isSiteOnPaidPlan( state, siteId ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		user: getCurrentUser( state ),
	};
} )( localize( ChecklistMain ) );
