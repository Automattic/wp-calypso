/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { flowRight } from 'lodash';
import FollowButtonContainer from 'calypso/blocks/follow-button';
import Gridicon from 'calypso/components/gridicon';

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
		<FormattedHeader
			brandFont
			headerText={ translate( 'Beta Testing', { context: 'Plugin Installer' } ) }
			subHeaderText={ translate( 'Help make the web a better place, one release at a time.' ) }
			align="left"
		/>
	);

	const main = (
		<Card>
			<div className="beta-testing__main-body">
				<div className="beta-testing__main-info">
					<CardHeading className="beta-testing__main-title" size={ 36 }>
						{ translate( 'Help shape the future of online publishing' ) }
					</CardHeading>

					<p>
						{ translate(
							'WordPress.com ships updates and improvements every single day, and beta users will get to experience some of these before anyone else. By taking part in this program, you will be helping to shape the future of WordPress.com, making it better for millions of people worldwide.'
						) }
					</p>
					<p>
						{ translate(
							"You won't be testing everything but there are some important ideas and projects we’d love to share with you."
						) }
					</p>

					<div className="beta-testing__cta-section">
						<Button
							className="beta-testing__view-horizon-button is-primary"
							href="https://horizon.wordpress.com/"
							onClick={ trackViewHorizonAction }
						>
							{ translate( 'Join the Beta Program' ) }
						</Button>

						<a
							className="beta-testing__external-link"
							href="https://horizonfeedback.wordpress.com/about/"
						>
							{ translate( 'Learn how it works' ) }
							<Gridicon icon="external" size={ 18 } />
						</a>
					</div>
				</div>
				<div className="beta-testing__main-image-wrapper">
					<img
						className="beta-testing__main-image"
						src="/calypso/images/illustrations/illustration-404.svg"
						alt={ translate( 'Beta Testing' ) }
					/>
				</div>
			</div>
			<div className="beta-testing__posts-wrapper">
				<h3 className="beta-testing__posts-title">
					{ translate( 'Recent Beta Features' ) }
					<div className="beta-testing__posts-actions">
						<FollowButtonContainer siteUrl="https://horizonfeedback.wordpress.com" />
						<a className="beta-testing__see-all" href="https://horizonfeedback.wordpress.com">
							{ translate( 'See All' ) }
							<Gridicon icon="chevron-right" size={ 18 } />
						</a>
					</div>
				</h3>
				<div className="beta-testing__posts">
					{ isRequestingPosts && ! posts && (
						<Fragment>
							<article className="beta-testing__post is-placeholder">
								<CardHeading tagName="h4" size={ 16 }></CardHeading>
								<p></p>
								<p></p>
							</article>
							<article className="beta-testing__post is-placeholder">
								<CardHeading tagName="h4" size={ 16 }></CardHeading>
								<p></p>
								<p></p>
							</article>
							<article className="beta-testing__post is-placeholder">
								<CardHeading tagName="h4" size={ 16 }></CardHeading>
								<p></p>
								<p></p>
							</article>
						</Fragment>
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
			</div>
		</Card>
	);
	return (
		<Main wideLayout>
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
