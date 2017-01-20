/**
 * External dependencies
 */
import React from 'react';
import { defer, noop } from 'lodash';

/**
 * Internal dependencies
 */
import RootChild from 'components/root-child';
import DialogBase from './dialog-base';

export default React.createClass( {
	propTypes: {
		isVisible: React.PropTypes.bool,
		baseClassName: React.PropTypes.string,
		enterTimeout: React.PropTypes.number,
		leaveTimeout: React.PropTypes.number,
		transitionLeave: React.PropTypes.bool,
		onClose: React.PropTypes.func,
		onClosed: React.PropTypes.func,
		onClickOutside: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			isVisible: false,
			leaveTimeout: 200,
			onClosed: noop,
			onClickOutside: noop
		};
	},

	checkOnClosed( ref ) {
		if ( null === ref ) {
			defer( this.props.onClosed );
		}
	},

	render: function() {
		const {
			isVisible
		} = this.props;

		return (
			<RootChild>
				{ isVisible && (
					<DialogBase
						{ ...this.props }
						ref={ this.checkOnClosed }
						key="dialog"
						onDialogClose={ this.onDialogClose } />
				) }
			</RootChild>
		);
	},

	onDialogClose: function( action ) {
		if ( this.props.onClose ) {
			this.props.onClose( action );
		}
	}
} );
