import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryPostTypes from 'calypso/components/data/query-post-types';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PostTypeFilter from 'calypso/my-sites/post-type-filter';
import PostTypeList from 'calypso/my-sites/post-type-list';
import { getPostType, isPostTypeSupported } from 'calypso/state/post-types/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PostTypeForbidden from './post-type-forbidden';
import PostTypeUnsupported from './post-type-unsupported';

function Types( {
	siteId,
	query,
	postType,
	postTypeSupported,
	userCanEdit,
	statusSlug,
	showPublishedStatus,
	translate,
} ) {
	let subHeaderText = '';
	switch ( get( postType, 'label', '' ) ) {
		case 'Testimonials':
			subHeaderText = translate(
				'Create and manage all the testimonials on your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: <InlineSupportLink supportContext="testimonials" showIcon={ false } />,
					},
				}
			);
			break;

		case 'Projects':
			subHeaderText = translate(
				'Create, edit, and manage the portfolio projects on your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: <InlineSupportLink supportContext="portfolios" showIcon={ false } />,
					},
				}
			);
			break;

		case 'Reusable blocks':
			subHeaderText = translate(
				'Create, edit, and manage the reusable blocks on your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: (
							<InlineSupportLink supportContext="reusable-blocks" showIcon={ false } />
						),
					},
				}
			);
			break;
	}

	return (
		<Main wideLayout>
			<ScreenOptionsTab wpAdminPath={ `edit.php?post_type=${ query.type }` } />
			<DocumentHead title={ get( postType, 'label', '' ) } />
			<PageViewTracker path={ siteId ? '/types/:site' : '/types' } title="Custom Post Type" />
			<NavigationHeader title={ get( postType, 'label', '' ) } subtitle={ subHeaderText } />
			{ userCanEdit &&
				postTypeSupported && [
					<PostTypeFilter
						key="filter"
						query={ userCanEdit ? query : null }
						statusSlug={ statusSlug }
					/>,
					<PostTypeList
						key="list"
						query={ userCanEdit ? query : null }
						showPublishedStatus={ showPublishedStatus }
						scrollContainer={ document.body }
					/>,
				] }
			{ ! postTypeSupported && <PostTypeUnsupported type={ query.type } /> }
			{ ! userCanEdit && <PostTypeForbidden /> }
			{ siteId && <QueryPostTypes siteId={ siteId } /> }
		</Main>
	);
}

Types.propTypes = {
	siteId: PropTypes.number,
	query: PropTypes.object,
	postType: PropTypes.object,
	postTypeSupported: PropTypes.bool,
	userCanEdit: PropTypes.bool,
	statusSlug: PropTypes.string,
	showPublishedStatus: PropTypes.bool,
};

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const postType = getPostType( state, siteId, ownProps.query.type );
	const capability = get( postType, [ 'capabilities', 'edit_posts' ], null );

	return {
		siteId,
		postType,
		postTypeSupported: isPostTypeSupported( state, siteId, ownProps.query.type ),
		userCanEdit: canCurrentUser( state, siteId, capability ),
	};
} )( localize( Types ) );
