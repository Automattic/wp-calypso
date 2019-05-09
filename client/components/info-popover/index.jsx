/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
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
		rootClassName: PropTypes.string,
	};

	static defaultProps = {
		autoRtl: true,
		icon: 'info-outline',
		iconSize: 18,
		position: 'bottom',
	};

	iconRef = React.createRef();

	state = { showPopover: false };

	handleClickOrKeyDown = event => {
		if ( event.type === 'keydown' ) {
			// ArrowDown only opens the popup
			if ( event.key === 'ArrowDown' && this.state.showPopover ) {
				return;
			}

			// Esc only closes the popup
			if ( event.key === 'Esc' && ! this.state.showPopover ) {
				return;
			}

			// Enter and Space toggle the popup
			if ( event.key !== 'Enter' && event.key !== ' ' ) {
				return;
			}
		}

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
			<Fragment>
				<span
					role="button"
					tabIndex="0"
					aria-haspopup
					aria-expanded={ this.state.showPopover }
					onClick={ this.handleClickOrKeyDown }
					onKeyDown={ this.handleClickOrKeyDown }
					ref={ this.iconRef }
					className={ classNames(
						'info-popover',
						{ 'is-active': this.state.showPopover },
						this.props.className
					) }
				>
					<Gridicon icon={ this.props.icon } size={ this.props.iconSize } />
				</span>
				{ this.state.showPopover && (
					<Popover
						autoRtl={ this.props.autoRtl }
						id={ this.props.id }
						isVisible
						context={ this.iconRef.current }
						ignoreContext={ this.props.ignoreContext }
						position={ this.props.position }
						onClose={ this.handleClose }
						className={ classNames( 'popover', 'info-popover__tooltip', this.props.className ) }
						rootClassName={ this.props.rootClassName }
					>
						{ this.props.children }
					</Popover>
				) }
			</Fragment>
		);
	}
}
