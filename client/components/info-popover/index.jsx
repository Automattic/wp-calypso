/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import analytics from 'lib/analytics';

export default class InfoPopover extends Component {
	static propTypes = {
		autoRtl: PropTypes.bool,
		className: PropTypes.string,
		gaEventCategory: PropTypes.string,
		icon: PropTypes.string,
		iconSize: PropTypes.number,
		id: PropTypes.string,
		ignoreContext: PropTypes.shape( {
			getDOMNode: PropTypes.func,
		} ),
		popoverName: PropTypes.string,
		position: PropTypes.oneOf( [
			'top',
			'top right',
			'right',
			'bottom right',
			'bottom',
			'bottom left',
			'left',
			'top left',
		] ),
	};

	static defaultProps = {
		autoRtl: true,
		icon: 'info-outline',
		iconSize: 18,
		position: 'bottom',
	};

	state = { showPopover: false };

	handleClick = event => {
		event.preventDefault();
		event.stopPropagation();

		this.setState( { showPopover: ! this.state.showPopover }, this.recordStats );
	};

	handleClose = () => this.setState( { showPopover: false }, this.recordStats );

	recordStats = () => {
		const { gaEventCategory, popoverName } = this.props;

		if ( gaEventCategory && popoverName ) {
			const dialogState = this.state.showPopover ? ' Opened' : ' Closed';
			analytics.ga.recordEvent( gaEventCategory, 'InfoPopover: ' + popoverName + dialogState );
		}
	};

	render() {
		return (
			<span
				onClick={ this.handleClick }
				ref="infoPopover"
				className={ classNames(
					'info-popover',
					{ is_active: this.state.showPopover },
					this.props.className
				) }
			>
				<Gridicon icon={ this.props.icon } size={ this.props.iconSize } />
				<Popover
					autoRtl={ this.props.autoRtl }
					id={ this.props.id }
					isVisible={ this.state.showPopover }
					context={ this.refs && this.refs.infoPopover }
					ignoreContext={ this.props.ignoreContext }
					position={ this.props.position }
					onClose={ this.handleClose }
					className={ classNames( 'popover', 'info-popover__tooltip', this.props.className ) }
				>
					{ this.props.children }
				</Popover>
			</span>
		);
	}
}
