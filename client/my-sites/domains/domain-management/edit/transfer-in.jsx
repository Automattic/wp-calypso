/**
 * External dependencies
 *
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Edit from './index';

class TransferIn extends React.PureComponent {
	render() {
		return <Edit { ...this.props } isTransfer />;
	}
}

export default TransferIn;
