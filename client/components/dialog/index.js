/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { defer, noop } from 'lodash';

/**
 * Internal dependencies
 */
import RootChild from 'components/root-child';
import DialogBase from './dialog-base';

class Dialog extends Component {
	static propTypes = {
		isVisible: PropTypes.bool,
		baseClassName: PropTypes.string,
		leaveTimeout: PropTypes.number,
		onClose: PropTypes.func,
		onClosed: PropTypes.func,
	}

	static defaultProps = {
		isVisible: false,
		leaveTimeout: 200,
		onClosed: noop,
	}

	checkOnClosed = ( ref ) => {
		if ( null === ref ) {
			defer( this.props.onClosed );
		}
	}

	render() {
		return (
			<RootChild>
				<DialogBase
					{ ...this.props }
					ref={ this.checkOnClosed }
					key="dialog"
					onDialogClose={ this.onDialogClose } />
			</RootChild>
		);
	}

	onDialogClose = ( action ) => {
		if ( this.props.onClose ) {
			this.props.onClose( action );
		}
	}
}

export default Dialog;
