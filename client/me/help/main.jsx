/**
 * External dependencies
 */
import { find } from 'lodash';
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import debugModule from 'debug';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import analytics from 'lib/analytics';
import {
	getCurrentUserId,
	isCurrentUserEmailVerified
} from 'state/current-user/selectors';
import HappinessEngineers from 'me/help/help-happiness-engineers';
import MeSidebarNavigation from 'me/sidebar-navigation';
import HelpSearch from './help-search';
import HelpTeaserButton from './help-teaser-button';
import CompactCard from 'components/card/compact';
import Button from 'components/button';
import SectionHeader from 'components/section-header';
import HelpResult from './help-results/item';
import HelpUnverifiedWarning from './help-unverified-warning';
import {
	getUserPurchases,
	isFetchingUserPurchases
} from 'state/purchases/selectors';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import QueryUserPurchases from 'components/data/query-user-purchases';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:help-search' );

const Help = React.createClass( {
	displayName: 'Help',

	mixins: [ PureRenderMixin ],

	getHelpfulArticles: function() {
		const helpfulResults = [
			{
				link: 'https://en.support.wordpress.com/com-vs-org/',
				title: this.translate( 'Can\'t add your theme or plugin?' ),
				description: this.translate(
					'Learn about the differences between a fully hosted WordPress.com site and a ' +
					'self-hosted WordPress.org site. Themes and plugins can be uploaded to self-hosted sites only.'
				)
			},
			{
				link: 'https://en.support.wordpress.com/all-about-domains/',
				title: this.translate( 'All About Domains' ),
				description: this.translate( 'Set up your domain whether it’s registered with WordPress.com or elsewhere.' )
			},
			{
				link: 'https://en.support.wordpress.com/start/',
				title: this.translate( 'Get Started' ),
				description: this.translate(
					'No matter what kind of site you want to build, our five-step checklists will get you set up and ready to publish.'
				)
			},
			{
				link: 'https://en.support.wordpress.com/settings/privacy-settings/',
				title: this.translate( 'Privacy Settings' ),
				description: this.translate( 'Limit your site’s visibility or make it completely private.' )
			}
		];

		return (
			<div className="help-results">
				<SectionHeader label={ this.translate( 'Most Helpful Articles' ) } />
				{ helpfulResults.map( ( result, index ) => {
					const trackClick = () => {
						debug( 'Suggested result click: ', result.link );
						analytics.tracks.recordEvent( 'calypso_help_suggested_result_click', {
							link: result.link,
							position: index
						} );
					};

					return <HelpResult key={ result.link } helpLink={ result } iconTypeDescription="book" onClick={ trackClick } />
				} ) }
			</div>
		);
	},

	getSupportLinks: function() {
		return (
			<div className="help__support-links">
				<CompactCard className="help__support-link" href="https://support.wordpress.com/" target="__blank">
					<div className="help__support-link-section">
						<h2 className="help__support-link-title">{ this.translate( 'All support articles' ) }</h2>
						<p className="help__support-link-content">
							{ this.translate( 'Looking to learn more about a feature? Our docs have all the details.' ) }
						</p>
					</div>
				</CompactCard>
				<CompactCard className="help__support-link" href="https://dailypost.wordpress.com/" target="__blank">
					<div className="help__support-link-section">
						<h2 className="help__support-link-title">{ this.translate( 'The Daily Post' ) }</h2>
						<p className="help__support-link-content">
							{ this.translate( 'Get daily tips for your blog and connect with others to share your journey.' ) }
						</p>
					</div>
				</CompactCard>
				<CompactCard className="help__support-link help__support-link-contact" href="/help/contact/">
					<div className="help__support-link-section">
						<h2 className="help__support-link-title">{ this.translate( 'Get in touch' ) }</h2>
						<p className="help__support-link-content">
							{ this.translate( `Can't find the answer? Drop us a line and we'll lend a hand.` ) }
						</p>
					</div>
					<Button className="help__support-link-button" primary>{ this.translate( 'Contact Us' ) }</Button>
				</CompactCard>
		</div>
		);
	},

	getCoursesTeaser: function() {
		if ( ! this.props.showCoursesTeaser ) {
			return null;
		}

		return (
			<HelpTeaserButton
				href="/help/courses"
				title={ this.translate( 'Courses' ) }
				description={ this.translate( 'Learn how to make the most of your site with these courses and webinars' ) }/>
		);
	},

	getPlaceholders() {
		return (
			<Main className="help">
				<MeSidebarNavigation />
				<div className="help-search is-placeholder"/>
				<div className="help__help-teaser-button is-placeholder"/>
				<div className="help-results is-placeholder"/>
				<div className="help__support-links is-placeholder"/>
			</Main>
		);
	},

	render: function() {
		const {
			isEmailVerified,
			userId,
			isLoading
		} = this.props;

		if ( isLoading ) {
			return this.getPlaceholders();
		}

		return (
			<Main className="help">
				<MeSidebarNavigation />
				<HelpSearch />
				{ ! isEmailVerified && <HelpUnverifiedWarning /> }
				{ this.getCoursesTeaser() }
				{ this.getHelpfulArticles() }
				{ this.getSupportLinks() }
				<HappinessEngineers />
				<QueryUserPurchases userId={ userId } />
			</Main>
		);
	}
} );

export default connect(
	( state, ownProps ) => {
		const isEmailVerified = isCurrentUserEmailVerified( state );
		const userId = getCurrentUserId( state );
		const purchases = getUserPurchases( state, userId );
		const isLoading = isFetchingUserPurchases( state );
		const showCoursesTeaser = (
			ownProps.isCoursesEnabled &&
			purchases &&
			!! find( purchases, purchase => purchase.productSlug === PLAN_BUSINESS )
		);

		return {
			userId,
			showCoursesTeaser,
			isLoading,
			isEmailVerified,
		};
	}
)( Help );
