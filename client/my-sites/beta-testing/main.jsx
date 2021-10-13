import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import FollowButtonContainer from 'calypso/blocks/follow-button';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import usePostsQuery from 'calypso/data/posts/use-posts-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const query = {
	author: null,
	number: 3,
	order: 'DESC',
	http_envelope: 1,
	status: 'publish',
	type: 'post',
	category: 'testing',
};
const horizonSiteId = 90972941;

const BetaTesting = ( { trackViewHorizonAction } ) => {
	const translate = useTranslate();
	const { data = {}, isFetching: isRequestingPosts } = usePostsQuery(
		horizonSiteId,
		'horizon-latest',
		query
	);
	const { posts } = data;

	const main = (
		<section className="beta-testing">
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
						alt={ translate( 'Beta Testing', { context: 'Plugin Installer' } ) }
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
							<Gridicon icon="chevron-right" size={ 12 } />
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

					{ posts &&
						posts.map( ( post ) => {
							return (
								<article key={ post.ID } className="beta-testing__post">
									<CardHeading tagName="h4" size={ 16 }>
										<a href={ post.URL }>{ post.title }</a>
									</CardHeading>
									<div
										dangerouslySetInnerHTML={ { __html: post.excerpt } } // eslint-disable-line react/no-danger
									></div>
									<a className="beta-testing__post-read" href={ post.URL }>
										{ translate( 'Read more' ) }
									</a>
								</article>
							);
						} ) }
				</div>
			</div>
		</section>
	);
	return (
		<Main wideLayout>
			<PageViewTracker
				path={ `/beta-testing/:site` }
				title={ translate( 'Beta Testing', { context: 'Plugin Installer' } ) }
			/>
			<DocumentHead title={ translate( 'Beta Testing', { context: 'Plugin Installer' } ) } />
			<SidebarNavigation />
			{ main }
		</Main>
	);
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

export default connect( null, mapDispatchToProps, mergeProps )( BetaTesting );
