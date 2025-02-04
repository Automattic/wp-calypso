import { ToggleControl } from '@wordpress/components';
import clsx from 'clsx';
import { Children, Component } from 'react';
import InfoPopover from 'calypso/components/info-popover';

import './style.scss';

class PluginAction extends Component {
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
			/* eslint-disable jsx-a11y/click-events-have-key-events */
			/* eslint-disable jsx-a11y/no-static-element-interactions */
			<span
				className={ clsx( 'plugin-action__label', { hide: this.props.hideLabel } ) }
				ref={ this.disabledInfoLabelRef }
				onClick={ this.handleAction }
			>
				<span className="plugin-action__label-text">{ this.props.label }</span>
				<span className="plugin-action__label-disabled-info">{ this.renderDisabledInfo() }</span>
			</span>
			/* eslint-enable jsx-a11y/click-events-have-key-events */
			/* eslint-enable jsx-a11y/no-static-element-interactions */
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
			<>
				<ToggleControl
					onChange={ this.props.action }
					checked={ this.props.status }
					disabled={ this.props.inProgress || this.props.disabled || !! this.props.disabledInfo }
					id={ this.props.htmlFor }
					label={ this.renderLabel() }
					aria-label={ this.props.label }
					__nextHasNoMarginBottom
				/>
				{ this.props.toggleExtraContent }
			</>
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
		if ( 0 < Children.count( this.props.children ) ) {
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
			<div className={ clsx( 'plugin-action', additionalClasses, this.props.className ) }>
				{ this.renderInner() }
			</div>
		);
	}
}

export default PluginAction;
