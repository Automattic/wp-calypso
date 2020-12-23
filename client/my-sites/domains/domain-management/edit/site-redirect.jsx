/**
 * External dependencies
 *
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Edit from './index';

class SiteRedirect extends React.PureComponent {
	render() {
		return <Edit { ...this.props } isSiteRedirect />;
	}
}

export default SiteRedirect;
