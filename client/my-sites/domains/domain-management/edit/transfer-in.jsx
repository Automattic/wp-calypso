/**
 * External dependencies
 *
 */

import React from 'react';
import Edit from './index';

class TransferIn extends React.PureComponent {
	render() {
		return <Edit { ...this.props } isTransfer={ true } />;
	}
}

export default TransferIn;
