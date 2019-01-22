/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteAdminUrl, getSiteOption } from 'state/sites/selectors';
import { addQueryArgs } from 'lib/route';

class CalypsoifyIframe extends Component {
	render() {
		const { iframeUrl } = this.props;

		return (
			<Fragment>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				<div className="main main-column customize is-iframe" role="main">
					{ /* eslint-disable-next-line jsx-a11y/iframe-has-title, wpcalypso/jsx-classname-namespace */ }
					<iframe className={ 'is-iframe-loaded' } src={ iframeUrl } />
					<AsyncLoad require="blocks/inline-help" placeholder={ null } />
				</div>
			</Fragment>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const frameNonce = getSiteOption( state, siteId, 'frame_nonce' ) || '';
	const iframeUrl = addQueryArgs(
		{
			'frame-nonce': frameNonce,
		},
		getSiteAdminUrl( state, siteId, 'post-new.php' )
	);

	return {
		iframeUrl,
	};
} )( CalypsoifyIframe );
