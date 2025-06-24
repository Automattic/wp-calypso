import {
	isWpComBusinessPlan,
	isWpComEcommercePlan,
	getPlan,
	PLAN_BUSINESS,
} from '@automattic/calypso-products';
import { CompactCard, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Icon, external } from '@wordpress/icons';
import debugModule from 'debug';
import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import helpPurchases from 'calypso/assets/images/customer-home/illustration--secondary-earn.svg';
import helpDomains from 'calypso/assets/images/illustrations/help-domains.svg';
import helpGetStarted from 'calypso/assets/images/illustrations/help-getstarted.svg';
import helpPlugins from 'calypso/assets/images/illustrations/help-plugins.svg';
import helpPrivacy from 'calypso/assets/images/illustrations/help-privacy.svg';
import helpWebsite from 'calypso/assets/images/illustrations/help-website.svg';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { getUserPurchases, isFetchingUserPurchases } from 'calypso/state/purchases/selectors';
import HelpContactUsFooter from './help-contact-us-footer';
import HelpContactUsHeader from './help-contact-us-header';
import HelpResultItem from './help-results/help-result-item';
import HelpSearch from './help-search';
import HelpUnverifiedWarning from './help-unverified-warning';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * Module variables
 */
const debug = debugModule( 'calypso:help-search' );

class Help extends PureComponent {
	static displayName = 'Help';

	state = {
		isSearching: false,
	};

	getHelpfulArticles = () => {
		const helpfulResults = [
			{
				link: localizeUrl(
					'https://wordpress.com/support/do-i-need-a-website-a-blog-or-a-website-with-a-blog/'
				),
				title: this.props.translate( 'Do I Need a Website, a Blog, or a Website with a Blog?' ),
				description: this.props.translate(
					'If you’re building a brand new site, you might be wondering if you need a website, a blog, or a website with a blog. At WordPress.com, you can create all of these options easily, right in your dashboard.'
				),
				image: helpWebsite,
			},
			{
				link: localizeUrl( 'https://wordpress.com/support/plan-features/creator-plan/' ),
				title: this.props.translate( 'Uploading custom plugins and themes' ),
				description: this.props.translate(
					'Learn more about installing a custom theme or plugin using the %(businessPlanName)s plan.',
					{
						args: {
							businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
						},
					}
				),
				image: helpPlugins,
			},
			{
				link: localizeUrl( 'https://wordpress.com/support/domains/' ),
				title: this.props.translate( 'All About Domains' ),
				description: this.props.translate(
					'Set up your domain whether it’s registered with WordPress.com or elsewhere.'
				),
				image: helpDomains,
			},
			{
				link: localizeUrl( 'https://wordpress.com/support/getting-started-with-wordpress-com/' ),
				title: this.props.translate( 'Get Started' ),
				description: this.props.translate(
					'No matter what kind of site you want to build, our five-step checklists will get you set up and ready to publish.'
				),
				image: helpGetStarted,
			},
			{
				link: localizeUrl( 'https://wordpress.com/support/privacy-settings/' ),
				title: this.props.translate( 'Privacy Settings', { context: 'Site visibility settings' } ),
				description: this.props.translate(
					'Limit your site’s visibility or make it completely private.'
				),
				image: helpPrivacy,
			},
			{
				link: localizeUrl( 'https://wordpress.com/support/manage-purchases/' ),
				title: this.props.translate( 'Managing Purchases, Renewals, and Cancellations' ),
				description: this.props.translate(
					'Have a question or need to change something about a purchase you have made? Learn how.'
				),
				image: helpPurchases,
			},
		];

		return (
			<>
				<h2 className="help__section-title">{ this.props.translate( 'Most Helpful Articles' ) }</h2>
				<div className="help-results">
					{ helpfulResults.map( ( result, index ) => {
						const trackClick = () => {
							debug( 'Suggested result click: ', result.link );
							recordTracksEvent( 'calypso_help_suggested_result_click', {
								link: result.link,
								position: index,
							} );
						};

						return (
							<HelpResultItem
								key={ result.link }
								helpLink={ result }
								iconTypeDescription="book"
								onClick={ trackClick }
								openInHelpCenter
							/>
						);
					} ) }
				</div>
			</>
		);
	};

	getSupportLinks = () => (
		<>
			<h2 className="help__section-title">{ this.props.translate( 'More Resources' ) }</h2>
			<div className="help__support-links">
				<CompactCard
					className="help__support-link"
					href="https://www.youtube.com/@WordPressdotcom"
					target="_blank"
				>
					<Gridicon icon="video" size={ 36 } />
					<div className="help__support-link-section">
						<h2 className="help__support-link-title">
							{ this.props.translate( 'Video tutorials' ) }
							<Icon
								icon={ external }
								size={ 16 }
								className="help__support-link-title__external-icon"
							/>
						</h2>
						<p className="help__support-link-content">
							{ this.props.translate(
								'These short videos will demonstrate some of our most popular features.'
							) }
						</p>
					</div>
				</CompactCard>
				<CompactCard
					className="help__support-link"
					href={ localizeUrl(
						'https://wordpress.com/support/courses?ref=wpcom-help-more-resources'
					) }
					target="_blank"
				>
					<Gridicon icon="mail" size={ 36 } />
					<div className="help__support-link-section">
						<h2 className="help__support-link-title">
							{ this.props.translate( 'Courses' ) }
							<Icon
								icon={ external }
								size={ 16 }
								className="help__support-link-title__external-icon"
							/>
						</h2>
						<p className="help__support-link-content">
							{ this.props.translate( 'Enroll in a course taught by WordPress experts.' ) }
						</p>
					</div>
				</CompactCard>
				<CompactCard
					className="help__support-link"
					href={ localizeUrl( 'https://wordpress.com/support/' ) }
					target="_blank"
				>
					<Gridicon icon="list-ordered" size={ 36 } />
					<div className="help__support-link-section">
						<h2 className="help__support-link-title">
							{ this.props.translate( 'Guides' ) }
							<Icon
								icon={ external }
								size={ 16 }
								className="help__support-link-title__external-icon"
							/>
						</h2>
						<p className="help__support-link-content">
							{ this.props.translate( 'Step-by-step guides for WordPress.com.' ) }
						</p>
					</div>
				</CompactCard>
			</div>
		</>
	);

	trackCoursesButtonClick = () => {
		const { isBusinessOrEcomPlanUser } = this.props;
		recordTracksEvent( 'calypso_help_courses_click', {
			is_business_or_ecommerce_plan_user: isBusinessOrEcomPlanUser,
		} );
	};

	getPlaceholders = () => (
		<Main className="help" wideLayout>
			<div className="help-search is-placeholder" />
			<div className="help-results is-placeholder" />
			<div className="help__support-links is-placeholder" />
		</Main>
	);

	setIsSearching = ( status ) => {
		this.setState( {
			isSearching: status,
		} );
	};

	render() {
		const { isEmailVerified, isLoading, translate } = this.props;

		if ( isLoading ) {
			return this.getPlaceholders();
		}

		return (
			<Main className="help" wideLayout>
				<PageViewTracker path="/help" title="Help" />

				<NavigationHeader
					navigationItems={ [] }
					title={ translate( 'Support' ) }
					subtitle={ translate( 'Get help with your WordPress.com site.' ) }
				>
					<HelpContactUsHeader />
				</NavigationHeader>

				<HelpSearch onSearch={ this.setIsSearching } />
				{ ! this.state.isSearching && (
					<div className="help__inner-wrapper">
						{ ! isEmailVerified && <HelpUnverifiedWarning /> }
						{ this.getHelpfulArticles() }
						{ this.getSupportLinks() }
					</div>
				) }
				<HelpContactUsFooter />
				<QueryUserPurchases />
			</Main>
		);
	}
}

const getProductSlugs = ( purchases ) => purchases.map( ( purchase ) => purchase.productSlug );

export const mapStateToProps = ( state ) => {
	const isEmailVerified = isCurrentUserEmailVerified( state );
	const purchases = getUserPurchases( state );
	const purchaseSlugs = purchases && getProductSlugs( purchases );
	const isLoading = isFetchingUserPurchases( state );
	const isBusinessOrEcomPlanUser = !! (
		purchaseSlugs &&
		( purchaseSlugs.some( isWpComBusinessPlan ) || purchaseSlugs.some( isWpComEcommercePlan ) )
	);

	return {
		isBusinessOrEcomPlanUser,
		isLoading,
		isEmailVerified,
	};
};

export default connect( mapStateToProps )( localize( Help ) );
