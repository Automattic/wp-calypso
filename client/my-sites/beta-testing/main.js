/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { flowRight } from 'lodash';
import FollowButtonContainer from 'calypso/blocks/follow-button';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import { Button, Card } from '@automattic/components';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteChecklist from 'calypso/components/data/query-site-checklist';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getPostsForQueryIgnoringPage,
	isRequestingPostsForQueryIgnoringPage,
} from 'calypso/state/posts/selectors';
import QueryPosts from 'calypso/components/data/query-posts';

/**
 * Style dependencies
 */
import './style.scss';
import CardHeading from 'calypso/components/card-heading';

const query = {
	author: null,
	number: 3,
	order: 'DESC',
	status: 'publish',
	type: 'post',
	category: 'testing',
};
const horizonSiteId = 90972941;

const BetaTesting = ( { siteId, posts, isRequestingPosts, trackViewHorizonAction } ) => {
	const translate = useTranslate();
	const header = (
		<div className="beta-testing__heading">
			<FormattedHeader
				brandFont
				headerText={ translate( 'Beta Testing' ) }
				subHeaderText={ translate( 'Join the WordPress.com Beta Community' ) }
				align="left"
			/>
			<div className="beta-testing__view-horizon-button">
				<Button href="https://horizon.wordpress.com/" onClick={ trackViewHorizonAction }>
					{ translate( 'Visit Horizon' ) }
				</Button>
			</div>
		</div>
	);

	const main = (
		<div className="beta-testing__main">
			<Card>
				<p>
					{ translate(
						"We’re making the web a better place, one release at a time -- and we’re asking for your help. WordPress.com ships updates and improvements every single day, and beta users will get to experience some of these before anyone else. By taking part in this program, you will be helping to shape the future of WordPress.com, making it better for you, your readers, your fellow bloggers, and for millions of people worldwide. You won't be testing everything but there are some important ideas and projects we’d love to share with you. It’s also worth noting that not everything you see will make it into WordPress.com or work exactly the same way once updates go public."
					) }
				</p>
			</Card>
			<Card>
				<CardHeading className="beta-testing__heading" tagName="h1" size={ 21 }>
					<span>{ translate( 'Recent Beta Features' ) }</span>
					<FollowButtonContainer siteUrl="https://horizonfeedback.wordpress.com" />
				</CardHeading>

				<div className="beta-testing__posts">
					{ isRequestingPosts && (
						<article className="beta-testing__post is-placeholder">
							<CardHeading tagName="h4" size={ 16 }></CardHeading>
							<p></p>
							<p></p>
							<p></p>
						</article>
					) }
					{ posts?.map( ( post ) => {
						return (
							<article key={ post.ID } className="beta-testing__post">
								<CardHeading tagName="h4" size={ 16 }>
									<a href={ post.URL }>{ post.title }</a>
								</CardHeading>
								<p>{ post.excerpt }</p>
							</article>
						);
					} ) }
				</div>
			</Card>

			<Card>
				<CardHeading tagName="h1" size={ 21 }>
					{ translate( 'How it Works' ) }
				</CardHeading>
				<p>{ translate( 'Welcome to Horizon: a beta testing project for WordPress.com' ) }</p>
				<p>
					{ translate(
						'Horizon is where the makers of WordPress.com test upcoming changes and new features with the WordPress.com community.'
					) }
				</p>
				<p>
					{ translate(
						'By volunteering to be a Horizon beta tester, you will sometimes see small and big changes still under development. We will share information about these updates and features through the Horizon blog.'
					) }
				</p>
				<p>{ translate( 'Please keep in mind:' ) }</p>
				<ul>
					<li>{ translate( 'Not every new feature will be tested.' ) }</li>
					<li>{ translate( 'Involvement will be on a volunteer basis.' ) }</li>
					<li>
						{ translate(
							'Be aware: things might break! So please only use this on test or development sites.'
						) }
					</li>
				</ul>
				<p>
					{ translate(
						'We will use your experiences along with other data and insights such as stats, past experience, and company goals.'
					) }
				</p>
				<p>
					{ translate( 'Your participation will help us, you, and millions of people worldwide.' ) }
				</p>
				<p>{ translate( 'Please follow the Horizon blog to stay updated.' ) }</p>
			</Card>
		</div>
	);
	return (
		<Main wideLayout className="beta-testing__main">
			<QueryPosts siteId={ horizonSiteId } query={ { ...query } } />
			<PageViewTracker path={ `/beta-testing/:site` } title={ translate( 'Beta Testing' ) } />
			<DocumentHead title={ translate( 'Beta Testing' ) } />
			{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
			<SidebarNavigation />
			{ header }
			{ main }
		</Main>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		site: getSelectedSite( state ),
		posts: getPostsForQueryIgnoringPage( state, horizonSiteId, query ),
		isRequestingPosts: isRequestingPostsForQueryIgnoringPage( state, horizonSiteId, query ),
		siteId,
	};
};

const trackViewHorizonAction = ( isStaticHomePage ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_beta_testing_my_site_view_horizon_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_beta_testing', 'my_site_view_horizon' )
	);

const mapDispatchToProps = {
	trackViewHorizonAction,
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { isStaticHomePage } = stateProps;
	return {
		...ownProps,
		...stateProps,
		trackViewHorizonAction: () => dispatchProps.trackViewHorizonAction( isStaticHomePage ),
	};
};

const connectBetaTesting = connect( mapStateToProps, mapDispatchToProps, mergeProps );

export default flowRight( connectBetaTesting )( BetaTesting );
