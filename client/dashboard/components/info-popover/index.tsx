import { Popover } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { createRef, Component, ComponentProps, Fragment, ReactNode, MouseEventHandler } from 'react';
import { gridiconToWordPressIcon } from '../../utils/gridicons';

import './style.scss';

interface InfoPopoverProps {
	autoRtl?: boolean;
	className?: string;
	icon?: string | ReactNode;
	iconSize?: number;
	id?: string;
	ignoreContext?: {
		getDOMNode: () => HTMLElement | null;
	};
	onOpen?: () => {};
	onClose?: () => {};
	popoverName?: string;
	placement?: ComponentProps<typeof Popover>['placement'];
	showOnHover?: boolean;
	children: ReactNode;
	'aria-label'?: string;
}

export default class InfoPopover extends Component<InfoPopoverProps> {

	static defaultProps = {
		autoRtl: true,
		icon: 'info',
		iconSize: 18,
		placement: 'bottom',
		showOnHover: false,
	};

	iconRef = createRef<HTMLButtonElement>();

	state = { showPopover: false };
	inPopover = false;

	handleClick: MouseEventHandler<HTMLButtonElement> = ( e ) => {
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

		this.setState( { showPopover: ! showPopover } );
	};

	handleClose = () => {
		this.props.onClose?.();
		this.setState( { showPopover: false } );
	};

	handleOnMouseEnterButton = () => {
		const { onOpen, showOnHover } = this.props;

		if ( ! showOnHover ) {
			return;
		}

		onOpen?.();
		this.setState( { showPopover: true } );
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

			this.setState( { showPopover: false } );
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
					aria-label={ this.props[ 'aria-label' ] || __( 'More information' ) }
					onClick={ this.handleClick }
					onMouseEnter={ this.handleOnMouseEnterButton }
					onMouseLeave={ this.handleOnMouseLeave }
					ref={ this.iconRef }
					className={ clsx( 'info-popover', this.props.className, {
						'is-active': this.state.showPopover,
					} ) }
				>
					{ typeof this.props.icon === 'string' ? (
						<Icon
							ref={ this.iconRef }
							icon={ gridiconToWordPressIcon( this.props.icon ) }
							size={ this.props.iconSize }
						/>
					) : (
						this.props.icon
					) }
				</button>
				{ this.state.showPopover && (
					<Popover
						autoRtl={ this.props.autoRtl }
						id={ this.props.id }
						isVisible
						context={ this.iconRef.current }
						ignoreContext={ this.props.ignoreContext }
						placement={ this.props.placement }
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
