/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CompactToggle from 'components/forms/form-toggle/compact';
import InfoPopover from 'components/info-popover';

const PluginAction = React.createClass( {
	handleAction( event ) {
		if ( ! this.props.disabledInfo ) {
			this.props.action();
		} else {
			this.refs.infoPopover._onClick( event );
		}
	},

	renderLabel() {
		if ( this.props.label ) {
			return (
				<label
					className="plugin-action__label"
					ref="disabledInfoLabel"
					onClick={ this.handleAction }
					htmlFor={ this.props.htmlFor }
					key="renderDisabledInfoLabel"
					>
					{ this.props.label }
				</label>
			);
		}
		return null;
	},

	renderDisabledInfo() {
		return [
			<InfoPopover
				key="renderDisabledInfoPopOver"
				className="plugin-action__disabled-info"
				position="bottom left"
				popoverName={ 'Plugin Action Disabled' + this.props.label }
				gaEventCategory="Plugins"
				ref="infoPopover"
				ignoreContext={ this.refs && this.refs.disabledInfoLabel }
				>
				{ this.props.disabledInfo }
			</InfoPopover>,
			this.renderLabel()
		];
	},

	renderToggle() {
		return (
			<CompactToggle
				onChange={ this.props.action }
				checked={ this.props.status }
				toggling={ this.props.inProgress }
				disabled={ this.props.disabled }
				id={ this.props.htmlFor }
			>
				{ this.renderLabel() }
			</CompactToggle>
		);
	},

	renderChildren() {
		return (
			<div>
				<span className="plugin-action__children">{ this.props.children }</span>
				{ this.renderLabel() }
			</div>
		);
	},

	renderInner() {
		if ( this.props.disabledInfo ) {
			return this.renderDisabledInfo();
		}

		if ( 0 < React.Children.count( this.props.children ) ) {
			return this.renderChildren();
		}

		return this.renderToggle();
	},

	render() {
		const additionalClasses = {
			'is-disabled': this.props.disabled,
			'has-disabled-info': !! this.props.disabledInfo
		};

		return (
			<div className={ classNames( 'plugin-action', additionalClasses, this.props.className ) }>
				{ this.renderInner() }
			</div>
		);
	}
} );

export default PluginAction;
