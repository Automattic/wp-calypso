/**
 * External Dependencies
 **/
import React from 'react';

/**
 * Internal Dependencies
 **/
import { localize } from 'i18n-calypso';

class TransferOtherUser extends React.Component {
	render() {
		return <div>{ this.props.translate( 'Hello' ) }</div>;
	}
}

export default localize( TransferOtherUser );
