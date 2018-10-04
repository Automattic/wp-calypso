/**
 * External dependencies
 *
 * @format
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Edit from './index';

class TransferIn extends React.PureComponent {
	render() {
		return <Edit { ...this.props } isTransfer={ true } />;
	}
}

export default TransferIn;
