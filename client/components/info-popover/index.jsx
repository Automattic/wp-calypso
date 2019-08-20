/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import analytics from 'lib/analytics';

/**
 * Style dependencies
 */
import './style.scss';

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

	handleClick = e => {
		e.preventDefault();
		e.stopPropagation();
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
				<button
					type="button"
					aria-haspopup
					aria-expanded={ this.state.showPopover }
					aria-label={ translate( 'More information' ) }
					onClick={ this.handleClick }
					ref={ this.iconRef }
					className={ classNames(
						'info-popover',
						{ 'is-active': this.state.showPopover },
						this.props.className
					) }
				>
					<Gridicon icon={ this.props.icon } size={ this.props.iconSize } />
				</button>
				{ this.state.showPopover && (
					<Popover
						autoRtl={ this.props.autoRtl }
						id={ this.props.id }
						isVisible
						context={ this.iconRef.current }
						ignoreContext={ this.props.ignoreContext }
						position={ this.props.position }
						onClose={ this.handleClose }
						className={ classNames( 'info-popover__tooltip', this.props.className ) }
						rootClassName={ this.props.rootClassName }
					>
						{ this.props.children }
					</Popover>
				) }
			</Fragment>
		);
	}
}
