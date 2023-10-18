import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { JetpackConnectionHealthBanner } from 'calypso/components/jetpack/connection-health';
import Main from 'calypso/components/main';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { preventWidows } from 'calypso/lib/formatting';
import { withJetpackConnectionProblem } from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-problem.js';
import { getPreference } from 'calypso/state/preferences/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSiteId } from 'calypso/state/sites/selectors';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import CommentList from './comment-list';
import CommentTips, { COMMENTS_TIPS_DISMISSED_PREFERENCE } from './comment-tips';
import { NEWEST_FIRST } from './constants';
import './style.scss';

export class CommentsManagement extends Component {
	static propTypes = {
		analyticsPath: PropTypes.string,
		comments: PropTypes.array,
		page: PropTypes.number,
		postId: PropTypes.number,
		showPermissionError: PropTypes.bool,
		siteId: PropTypes.number,
		siteFragment: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		status: PropTypes.string,
		translate: PropTypes.func,
	};

	static defaultProps = {
		page: 1,
		status: 'all',
	};

	state = {
		order: NEWEST_FIRST,
	};

	setOrder = ( order ) => () => this.setState( { order } );

	render() {
		const {
			analyticsPath,
			changePage,
			isJetpack,
			isPossibleJetpackConnectionProblem,
			page,
			postId,
			showCommentList,
			showPermissionError,
			siteId,
			siteFragment,
			status,
			translate,
			hideModerationTips,
		} = this.props;
		const { order } = this.state;

		return (
			<Main className="comments" wideLayout>
				<ScreenOptionsTab wpAdminPath="edit-comments.php" />
				<PageViewTracker path={ analyticsPath } title="Comments" />
				{ isJetpack && isPossibleJetpackConnectionProblem && (
					<JetpackConnectionHealthBanner siteId={ siteId } />
				) }
				<DocumentHead title={ translate( 'Comments' ) } />
				{ ! showPermissionError && (
					<FormattedHeader
						brandFont
						className="comments__page-heading"
						headerText={ translate( 'Comments' ) }
						subHeaderText={ translate(
							'View, reply to, and manage all the comments across your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
							{
								components: {
									learnMoreLink: <InlineSupportLink supportContext="comments" showIcon={ false } />,
								},
							}
						) }
						align="left"
						hasScreenOptions
					/>
				) }
				{ showPermissionError && (
					<EmptyContent
						title={ preventWidows(
							translate( "Oops! You don't have permission to manage comments." )
						) }
						line={ preventWidows(
							translate( "If you think you should, contact this site's administrator." )
						) }
						illustration="/calypso/images/illustrations/error.svg"
					/>
				) }
				{ showCommentList && (
					<>
						{ ! hideModerationTips && <CommentTips /> }
						<CommentList
							key={ `${ siteId }-${ status }` }
							changePage={ changePage }
							order={ order }
							page={ page }
							postId={ postId }
							setOrder={ this.setOrder }
							siteId={ siteId }
							siteFragment={ siteFragment }
							status={ status }
						/>
					</>
				) }
			</Main>
		);
	}
}

const mapStateToProps = ( state, { siteFragment } ) => {
	const siteId = getSiteId( state, siteFragment );
	const canModerateComments = canCurrentUser( state, siteId, 'edit_posts' );
	const showPermissionError = ! canModerateComments;

	const showCommentList = ! showPermissionError;

	return {
		isJetpack: isJetpackSite( state, siteId ),
		siteId,
		showCommentList,
		showPermissionError,
		hideModerationTips: getPreference( state, COMMENTS_TIPS_DISMISSED_PREFERENCE ),
	};
};

export default connect( mapStateToProps )(
	localize( withJetpackConnectionProblem( CommentsManagement ) )
);
