/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { connect } from 'react-redux';
import { flowRight, endsWith, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import getCurrentRoute from 'state/selectors/get-current-route';
import { navigate, replaceHistory } from 'state/ui/actions';

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
		const { postId, postStatus, currentRoute, siteSlug } = this.props;

		if (
			postStatus === 'draft' &&
			prevProps.postStatus === 'auto-draft' &&
			! endsWith( currentRoute, `/${ postId }` )
		) {
			this.props.replaceHistory( `${ currentRoute }/${ postId }` );
		}

		if ( postStatus === 'trash' && endsWith( currentRoute, `/${ postId }` ) ) {
			const postType = startsWith( currentRoute, '/gutenberg/post/' ) ? 'posts' : 'pages';
			this.props.navigate( `/${ postType }/trashed/${ siteSlug }` );
		}
	}

	render() {
		return null;
	}
}

export default flowRight(
	withSelect( select => {
		const { getCurrentPost } = select( 'core/editor' );
		const { id, status } = getCurrentPost();

		return {
			postId: id,
			postStatus: status,
		};
	} ),
	connect(
		state => {
			const siteId = getSelectedSiteId( state );

			return {
				currentRoute: getCurrentRoute( state ),
				siteSlug: getSiteSlug( state, siteId ),
			};
		},
		{ navigate, replaceHistory }
	)
)( BrowserURL );
