/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { connect } from 'react-redux';
import { flowRight, endsWith, get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, isJetpackSite, isSingleUserSite } from 'state/sites/selectors';
import getCurrentRoute from 'state/selectors/get-current-route';
import { navigate, replaceHistory, setRoute } from 'state/ui/actions';

const getPostTypeTrashUrl = ( postType, siteSlug, isSiteJetpack, isSiteSingleUser ) => {
	const postTypeUrl = get( { page: 'pages', post: 'posts' }, postType, `types/${ postType }` );

	if ( postType === 'post' && ! isSiteJetpack && ! isSiteSingleUser ) {
		return `/${ postTypeUrl }/my/trashed/${ siteSlug }`;
	}

	return `/${ postTypeUrl }/trashed/${ siteSlug }`;
};

/**
 * After making changes to a new post, this component will update the url to append the post id:
 *
 * For example:
 * https://wordpress.com/gutenberg/post/mysiteslug
 *
 * https://wordpress.com/gutenberg/post/mysiteslug/1234
 */
export class BrowserURL extends Component {
	componentDidUpdate( prevProps ) {
		const {
			postId,
			postStatus,
			postType,
			currentRoute,
			siteSlug,
			isSiteJetpack,
			isSiteSingleUser,
		} = this.props;

		if (
			postStatus === 'draft' &&
			prevProps.postStatus === 'auto-draft' &&
			! endsWith( currentRoute, `/${ postId }` )
		) {
			//save the current context, to avoid an error noted in https://github.com/Automattic/wp-calypso/pull/28847#issuecomment-442056014
			this.props.replaceHistory( `${ currentRoute }/${ postId }`, true );
			this.props.setRoute( `${ currentRoute }/${ postId }` );
		}

		if ( postStatus === 'trash' && endsWith( currentRoute, `/${ postId }` ) ) {
			this.props.navigate(
				getPostTypeTrashUrl( postType, siteSlug, isSiteJetpack, isSiteSingleUser )
			);
		}
	}

	render() {
		return null;
	}
}

export default flowRight(
	withSelect( select => {
		const { getCurrentPost } = select( 'core/editor' );
		const { id, status, type } = getCurrentPost();

		return {
			postId: id,
			postStatus: status,
			postType: type,
		};
	} ),
	connect(
		state => {
			const siteId = getSelectedSiteId( state );

			return {
				currentRoute: getCurrentRoute( state ),
				siteSlug: getSiteSlug( state, siteId ),
				isSiteJetpack: isJetpackSite( state, siteId ),
				isSiteSingleUser: isSingleUserSite( state, siteId ),
			};
		},
		{ navigate, replaceHistory, setRoute }
	)
)( BrowserURL );
