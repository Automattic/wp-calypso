/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteOption, getSiteAdminUrl } from 'state/sites/selectors';
import { addQueryArgs } from 'lib/route';

/**
 * Style dependencies
 */
import './style.scss';

class CalypsoifyIframe extends Component {
	render() {
		const { iframeUrl } = this.props;

		return (
			<Fragment>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				<div className="main main-column calypsoify is-iframe" role="main">
					{ /* eslint-disable-next-line jsx-a11y/iframe-has-title, wpcalypso/jsx-classname-namespace */ }
					<iframe src={ iframeUrl } />
				</div>
			</Fragment>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const postId = ownProps.postId;
	const postType = ownProps.postType;

	const iframeUrl = addQueryArgs(
		pickBy( {
			post: postId,
			action: postId && 'edit', // If postId is set, open edit view.
			post_type: postType !== 'post' && postType, // Use postType if it's different than post.
			calypsoify: 1,
			'frame-nonce': getSiteOption( state, siteId, 'frame_nonce' ) || '',
		} ),
		getSiteAdminUrl( state, siteId, postId ? 'post.php' : 'post-new.php' )
	);

	return {
		iframeUrl,
	};
} )( CalypsoifyIframe );
