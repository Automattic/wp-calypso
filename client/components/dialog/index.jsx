/**
 * External dependencies
 */
import React from 'react';
import { defer, noop } from 'lodash';

/**
 * Internal dependencies
 */
import CSSTransitionGroup from 'react-addons-css-transition-group';
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
			enterTimeout: 200,
			leaveTimeout: 200,
			transitionLeave: true,
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
			isVisible,
			baseClassName,
			transitionLeave,
			enterTimeout,
			leaveTimeout
		} = this.props;

		return (
			<RootChild>
				<CSSTransitionGroup
					transitionName={ baseClassName || 'dialog' }
					transitionLeave={ transitionLeave }
					transitionEnterTimeout={ enterTimeout }
					transitionLeaveTimeout={ leaveTimeout }>
					{ isVisible && (
						<DialogBase
							{ ...this.props }
							ref={ this.checkOnClosed }
							key="dialog"
							onDialogClose={ this.onDialogClose } />
					) }
				</CSSTransitionGroup>
			</RootChild>
		);
	},

	onDialogClose: function( action ) {
		if ( this.props.onClose ) {
			this.props.onClose( action );
		}
	}
} );
