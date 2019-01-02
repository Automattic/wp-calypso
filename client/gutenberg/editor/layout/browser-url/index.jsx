/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { connect } from 'react-redux';
import { flowRight, endsWith } from 'lodash';

/**
 * Internal dependencies
 */
import getCurrentRoute from 'state/selectors/get-current-route';
import { replaceHistory, setRoute } from 'state/ui/actions';

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
		const { postId, postStatus, currentRoute } = this.props;

		if (
			postStatus === 'draft' &&
			prevProps.postStatus === 'auto-draft' &&
			! endsWith( currentRoute, `/${ postId }` )
		) {
			//save the current context, to avoid an error noted in https://github.com/Automattic/wp-calypso/pull/28847#issuecomment-442056014
			this.props.replaceHistory( `${ currentRoute }/${ postId }`, true );
			this.props.setRoute( `${ currentRoute }/${ postId }` );
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
		state => ( { currentRoute: getCurrentRoute( state ) } ),
		{ replaceHistory, setRoute }
	)
)( BrowserURL );
