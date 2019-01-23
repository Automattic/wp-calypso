/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

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

const getIframeUrl = ( siteAdminUrl, postId, postType ) => {
	if ( postId ) {
		return `${ siteAdminUrl }post.php?post=${ postId }&action=edit&calypsoify=1`;
	}
	if ( 'post' === postType ) {
		return `${ siteAdminUrl }post-new.php?calypsoify=1`;
	}
	return `${ siteAdminUrl }post-new.php?post_type=${ postType }&calypsoify=1`;
};

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
	const frameNonce = getSiteOption( state, siteId, 'frame_nonce' ) || '';
	const siteAdminUrl = getSiteAdminUrl( state, siteId );

	const iframeUrl = addQueryArgs(
		{
			'frame-nonce': frameNonce,
		},
		getIframeUrl( siteAdminUrl, ownProps.postId, ownProps.postType )
	);

	return {
		iframeUrl,
	};
} )( CalypsoifyIframe );
