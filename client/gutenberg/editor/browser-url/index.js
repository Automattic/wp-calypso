/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

/**
 * After making changes to a new post, this component will update the url to append the post id:
 *
 * For example:
 * https://wordpress.com/gutenberg/post/mysiteslug
 *
 * https://wordpress.com/gutenberg/post/mysiteslug/1234
 */
export class BrowserURL extends Component {
	constructor() {
		super( ...arguments );

		this.state = {
			historyId: null,
		};
	}

	componentDidUpdate( prevProps ) {
		const { postId, postStatus } = this.props;
		const { historyId } = this.state;

		if ( ( postId !== prevProps.postId || postId !== historyId ) && postStatus !== 'auto-draft' ) {
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
			`${ window.location.href }/${ postId }`
		);

		this.setState( () => ( {
			historyId: postId,
		} ) );
	}

	render() {
		return null;
	}
}

export default withSelect( ( select ) => {
	const { getCurrentPost } = select( 'core/editor' );
	const { id, status } = getCurrentPost();

	return {
		postId: id,
		postStatus: status,
	};
} )( BrowserURL );
