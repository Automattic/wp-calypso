import { isEnabled } from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { JetpackConnectionHealthBanner } from 'calypso/components/jetpack/connection-health';
import Main from 'calypso/components/main';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { mapPostStatus } from 'calypso/lib/route';
import PostTypeFilter from 'calypso/my-sites/post-type-filter';
import PostTypeList from 'calypso/my-sites/post-type-list';
import isJetpackConnectionProblem from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-problem.js';
import { POST_STATUSES } from 'calypso/state/posts/constants';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class PostsMain extends Component {
	getAnalyticsPath() {
		const { siteId, statusSlug, author } = this.props;
		let analyticsPath = '/posts';

		if ( author ) {
			analyticsPath += '/my';
		}

		if ( statusSlug ) {
			analyticsPath += `/${ statusSlug }`;
		}

		if ( siteId ) {
			analyticsPath += '/:site';
		}

		return analyticsPath;
	}

	getAnalyticsTitle() {
		const { statusSlug } = this.props;

		if ( statusSlug ) {
			return 'Blog Posts > ' + titlecase( statusSlug );
		}

		return 'Blog Posts > Published';
	}

	render() {
		const {
			author,
			category,
			search,
			siteId,
			statusSlug,
			tag,
			translate,
			isJetpack,
			isPossibleJetpackConnectionProblem,
		} = this.props;
		const status = mapPostStatus( statusSlug );
		/* Check if All Sites Mode */
		const isAllSites = siteId ? 1 : 0;
		const query = {
			author,
			category,
			number: 20, // max supported by /me/posts endpoint for all-sites mode
			order: status === 'future' ? 'ASC' : 'DESC',
			search,
			site_visibility: ! siteId ? 'visible' : undefined,
			// When searching, search across all statuses so the user can
			// always find what they are looking for, regardless of what tab
			// the search was initiated from. Use POST_STATUSES rather than
			// "any" to do this, since the latter excludes trashed posts.
			status: search ? POST_STATUSES.join( ',' ) : status,
			tag,
			type: 'post',
		};
		// Since searches are across all statuses, the status needs to be shown
		// next to each post.
		const showPublishedStatus = Boolean( query.search );

		return (
			<Main wideLayout className="posts">
				{ isJetpack && isPossibleJetpackConnectionProblem && (
					<JetpackConnectionHealthBanner siteId={ siteId } />
				) }
				{ ! isJetpack && isEnabled( 'jitms' ) && (
					<AsyncLoad
						require="calypso/blocks/jitm"
						template="notice"
						placeholder={ null }
						messagePath="calypso:edit-post:admin_notices"
					/>
				) }
				<ScreenOptionsTab wpAdminPath="edit.php" />
				<PageViewTracker path={ this.getAnalyticsPath() } title={ this.getAnalyticsTitle() } />
				<DocumentHead title={ translate( 'Posts' ) } />
				<FormattedHeader
					brandFont
					className="posts__page-heading"
					headerText={ translate( 'Posts' ) }
					subHeaderText={ translate(
						'Create, edit, and manage the posts on your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						'Create, edit, and manage the posts on your sites. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							count: isAllSites,
							components: {
								learnMoreLink: <InlineSupportLink supportContext="posts" showIcon={ false } />,
							},
						}
					) }
					align="left"
					hasScreenOptions
				/>
				<PostTypeFilter query={ query } siteId={ siteId } statusSlug={ statusSlug } />
				<PostTypeList
					query={ query }
					showPublishedStatus={ showPublishedStatus }
					scrollContainer={ document.body }
				/>
			</Main>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		isJetpack: isJetpackSite( state, siteId ),
		isPossibleJetpackConnectionProblem: isJetpackConnectionProblem( state, siteId ),
	};
} )( localize( PostsMain ) );
