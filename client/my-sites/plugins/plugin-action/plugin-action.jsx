/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormToggle from 'calypso/components/forms/form-toggle';
import InfoPopover from 'calypso/components/info-popover';

/**
 * Style dependencies
 */
import './style.scss';

class PluginAction extends React.Component {
	handleAction = ( event ) => {
		if ( ! this.props.disabledInfo ) {
			this.props.action();
		} else {
			this.infoPopover.handleClick( event );
		}
	};

	disabledInfoLabelRef = ( ref ) => {
		this.disabledInfoLabel = ref;
	};

	renderLabel() {
		if ( ! this.props.label ) {
			return null;
		}

		return (
			<span
				className="plugin-action__label"
				ref={ this.disabledInfoLabelRef }
				onClick={ this.handleAction }
			>
				{ this.props.label }
				{ this.renderDisabledInfo() }
			</span>
		);
	}

	infoPopoverRef = ( ref ) => {
		this.infoPopover = ref;
	};

	renderDisabledInfo() {
		if ( ! this.props.disabledInfo ) {
			return null;
		}

		return (
			<InfoPopover
				className="plugin-action__disabled-info"
				position="bottom left"
				popoverName={ 'Plugin Action Disabled' + this.props.label }
				gaEventCategory="Plugins"
				ref={ this.infoPopoverRef }
				ignoreContext={ this.disabledInfoLabel }
			>
				{ this.props.disabledInfo }
			</InfoPopover>
		);
	}

	renderToggle() {
		return (
			<FormToggle
				onChange={ this.props.action }
				checked={ this.props.status }
				disabled={ this.props.inProgress || this.props.disabled || !! this.props.disabledInfo }
				id={ this.props.htmlFor }
			>
				{ this.renderLabel() }
			</FormToggle>
		);
	}

	renderChildren() {
		return (
			<span className="plugin-action__children">
				{ this.props.children }
				{ this.renderLabel() }
			</span>
		);
	}

	renderInner() {
		if ( 0 < React.Children.count( this.props.children ) ) {
			return this.renderChildren();
		}

		return this.renderToggle();
	}

	render() {
		const additionalClasses = {
			'is-disabled': this.props.disabled,
			'has-disabled-info': !! this.props.disabledInfo,
		};

		return (
			<div className={ classNames( 'plugin-action', additionalClasses, this.props.className ) }>
				{ this.renderInner() }
			</div>
		);
	}
}

export default PluginAction;
