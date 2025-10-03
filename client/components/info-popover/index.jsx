import { Popover, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createRef, Component, Fragment } from 'react';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';

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
		onOpen: PropTypes.func,
		onClose: PropTypes.func,
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
		showOnHover: PropTypes.bool,
		children: PropTypes.node,
		'aria-label': PropTypes.string,
	};

	static defaultProps = {
		autoRtl: true,
		icon: 'info-outline',
		iconSize: 18,
		position: 'bottom',
		showOnHover: false,
	};

	iconRef = createRef();

	state = { showPopover: false };

	handleClick = ( e ) => {
		const { onOpen, showOnHover } = this.props;
		const { showPopover } = this.state;

		e.preventDefault();
		e.stopPropagation();

		if ( showOnHover ) {
			return;
		}

		// There's no "handleOpen" method for us to hook into,
		// so we check here to see if the intent is to open the popover
		// and fire onOpen accordingly
		if ( ! showPopover ) {
			onOpen?.();
		}

		this.setState( { showPopover: ! showPopover }, this.recordStats );
	};

	handleClose = () => {
		this.props.onClose?.();
		this.setState( { showPopover: false }, this.recordStats );
	};

	recordStats = () => {
		const { gaEventCategory, popoverName } = this.props;

		if ( gaEventCategory && popoverName ) {
			const dialogState = this.state.showPopover ? ' Opened' : ' Closed';
			gaRecordEvent( gaEventCategory, 'InfoPopover: ' + popoverName + dialogState );
		}
	};

	handleOnMouseEnterButton = () => {
		const { onOpen, showOnHover } = this.props;

		if ( ! showOnHover ) {
			return;
		}

		onOpen?.();
		this.setState( { showPopover: true }, this.recordStats );
	};

	handleOnMouseLeave = () => {
		setTimeout( () => {
			const { showOnHover } = this.props;

			if ( ! showOnHover ) {
				return;
			}

			if ( this.inPopover ) {
				return;
			}

			this.setState( { showPopover: false }, this.recordStats );
		}, 250 );
	};

	handleOnMouseEnterPopover = () => {
		this.inPopover = true;
	};

	handleOnMouseLeavePopover = () => {
		this.inPopover = false;
		this.handleOnMouseLeave();
	};

	render() {
		return (
			<Fragment>
				<button
					type="button"
					aria-haspopup
					aria-expanded={ this.state.showPopover }
					aria-label={ this.props[ 'aria-label' ] || translate( 'More information' ) }
					onClick={ this.handleClick }
					onMouseEnter={ this.handleOnMouseEnterButton }
					onMouseLeave={ this.handleOnMouseLeave }
					ref={ this.iconRef }
					className={ clsx( 'info-popover', this.props.className, {
						'is-active': this.state.showPopover,
					} ) }
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
						className={ clsx( 'info-popover__tooltip', this.props.className ) }
						onMouseEnter={ this.handleOnMouseEnterPopover }
						onMouseLeave={ this.handleOnMouseLeavePopover }
					>
						{ this.props.children }
					</Popover>
				) }
			</Fragment>
		);
	}
}
