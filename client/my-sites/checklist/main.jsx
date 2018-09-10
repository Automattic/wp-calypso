/** @format */
/**
 * External dependencies
 */
import page from 'page';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import ChecklistShowShare from './share';
import DocumentHead from 'components/data/document-head';
import EmptyContent from 'components/empty-content';
import FormattedHeader from 'components/formatted-header';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import isSiteOnFreePlan from 'state/selectors/is-site-on-free-plan';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import WpcomChecklist from './wpcom-checklist';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, isJetpackSite, isNewSite } from 'state/sites/selectors';
import { isEnabled } from 'config';

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
			isEnabled( 'jetpack/checklist' ) &&
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

	renderHeader() {
		const { displayMode, isNewlyCreatedSite, translate } = this.props;
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
							this.props.siteHasFreePlan
								? translate( 'Your site has been created!' )
								: translate( 'Thank you for your purchase!' )
						}
						subHeaderText={
							'gsuite' === displayMode
								? translate(
										'We emailed %(email)s with instructions to complete your G Suite setup. ' +
											'In the mean time, let’s get your new site ready for you to share. ' +
											'We’ve prepared a list of things that will help you get there quickly.',
										{
											args: {
												email: this.props.user.email,
											},
										}
								  )
								: translate(
										"Now that your site has been created, it's time to get it ready for you to share. " +
											"We've prepared a list of things that will help you get there quickly."
								  )
						}
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
		const { checklistAvailable, displayMode, siteId, translate } = this.props;

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
					<>
						{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
						{ this.renderHeader() }
						<WpcomChecklist updateCompletion={ this.handleCompletionUpdate } />
					</>
				) : (
					<EmptyContent title={ translate( 'Checklist not available for this site' ) } />
				) }
			</Main>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const isAtomic = isSiteAutomatedTransfer( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );

	return {
		checklistAvailable: ! isAtomic && ( isEnabled( 'jetpack/checklist' ) || ! isJetpack ),
		isAtomic,
		isJetpack,
		isNewlyCreatedSite: isNewSite( state, siteId ),
		siteHasFreePlan: isSiteOnFreePlan( state, siteId ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		user: getCurrentUser( state ),
	};
} )( localize( ChecklistMain ) );
