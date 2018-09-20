/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import getCurrentRoute from 'state/selectors/get-current-route';


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
		const { postId, postStatus } = this.props;

		if ( postStatus === 'draft' && prevProps.postStatus === 'auto-draft' ) {
			this.setBrowserURL( postId );
		}
	}

	/**
	 * Replaces the browser URL with a post editor link for the given post ID
	 *
	 * @param {number} postId Post ID for which to generate post editor URL.
	 */
	setBrowserURL( postId ) {
		window.history.replaceState(
			{ id: postId },
			null,
			`${ this.props.currentRoute }/${ postId }`
		);
	}

	render() {
		return null;
	}
}

export default flowRight(
	withSelect( ( select ) => {
		const { getCurrentPost } = select( 'core/editor' );
		const { id, status } = getCurrentPost();

		return {
			postId: id,
			postStatus: status,
		};
	} ),
	connect(
		( state ) => {
			return {
				currentRoute: getCurrentRoute( state ),
			}
		}
	),
)( BrowserURL );
