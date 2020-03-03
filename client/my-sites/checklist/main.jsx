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
import QueryActiveTheme from 'components/data/query-active-theme';
import QueryCanonicalTheme from 'components/data/query-canonical-theme';

/**
 * State dependencies
 */
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import isSiteOnPaidPlan from 'state/selectors/is-site-on-paid-plan';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, isJetpackSite, isNewSite } from 'state/sites/selectors';
import { getActiveTheme, getCanonicalTheme } from 'state/themes/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class ChecklistMain extends PureComponent {
	state = { complete: false };

	handleCompletionUpdate = ( { complete } ) => void this.setState( { complete } );

	/**
	 * Redirect Jetpack checklists to /plans/my-plan/:siteSlug
	 *
	 * Guard for relevant props updated and correct conditions
	 *
	 * @param {object}   prevProps           Optional. Previous props from componentDidUpdate.
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
	 *
	 * @returns {string} The translated string
	 */
	getSubHeaderText() {
		const { displayMode, currentTheme, translate } = this.props;

		switch ( displayMode ) {
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

			case 'theme':
				return translate(
					'Your theme %(themeName)s by %(themeAuthor)s is now active on your site. ' +
						"Now that your site has been created, it's time to get it ready for you to share. " +
						"We've prepared a list of things that will help you get there quickly.",
					{
						args: {
							themeName: currentTheme && currentTheme.name,
							themeAuthor: currentTheme && currentTheme.author,
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
		const { displayMode, siteId, currentThemeId, translate } = this.props;

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
				{ siteId && 'theme' === displayMode && <QueryActiveTheme siteId={ siteId } /> }
				{ currentThemeId && <QueryCanonicalTheme themeId={ currentThemeId } siteId={ siteId } /> }
				{ this.renderHeader() }
				<WpcomChecklist updateCompletion={ this.handleCompletionUpdate } viewMode="checklist" />
			</Main>
		);
	}
}

export default connect( ( state, props ) => {
	const siteId = getSelectedSiteId( state );
	const isAtomic = isSiteAutomatedTransfer( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
	let themeInfo = {};
	if ( props.displayMode && 'theme' === props.displayMode ) {
		const currentThemeId = getActiveTheme( state, siteId );
		const currentTheme = currentThemeId && getCanonicalTheme( state, siteId, currentThemeId );
		themeInfo = { currentTheme, currentThemeId };
	}

	return {
		isAtomic,
		isJetpack,
		isNewlyCreatedSite: isNewSite( state, siteId ),
		siteHasPaidPlan: isSiteOnPaidPlan( state, siteId ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		user: getCurrentUser( state ),
		...themeInfo,
	};
} )( localize( ChecklistMain ) );
