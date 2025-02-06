import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { Component, isValidElement, ReactNode } from 'react';
// @todo: Convert to import from `components/gridicon`
// which makes Calypso mysteriously crash at the moment.
//
// eslint-disable-next-line no-restricted-imports

import './style.scss';

const GRIDICONS_WITH_DROP = [
	'add',
	'cross-circle',
	'ellipsis-circle',
	'help',
	'info',
	'notice',
	'pause',
	'play',
	'spam',
] as const;

const noop = () => {};

export type NoticeStatus =
	| 'is-error'
	| 'is-info'
	| 'is-success'
	| 'is-warning'
	| 'is-plain'
	| 'is-transparent-info';

interface NoticeProps {
	className?: string;
	duration?: number;
	icon?: string | ReactNode;
	isCompact?: boolean;
	isLoading?: boolean;
	onDismissClick?: () => void;
	showDismiss?: boolean;
	status?: NoticeStatus;
	/**
	 * The default scss styling of this component is of theme dark
	 * and we only have 1 override theme which is the light theme
	 */
	theme?: 'light' | 'dark';
	text?: ReactNode;
	translate: ( text: string ) => string;
	children?: ReactNode;
}

export class Notice extends Component< NoticeProps > {
	static defaultProps = {
		className: '',
		duration: 0,
		icon: null,
		isCompact: false,
		isLoading: false,
		onDismissClick: noop,
		status: null,
		text: null,
	};

	private dismissTimeout: ReturnType< typeof setTimeout > | null = null;

	componentDidMount(): void {
		if ( this.props.duration! > 0 ) {
			this.dismissTimeout = setTimeout( this.props.onDismissClick!, this.props.duration! );
		}
	}

	componentWillUnmount(): void {
		if ( this.dismissTimeout ) {
			clearTimeout( this.dismissTimeout );
		}
	}

	componentDidUpdate(): void {
		if ( this.dismissTimeout ) {
			clearTimeout( this.dismissTimeout );
		}

		if ( this.props.duration! > 0 ) {
			this.dismissTimeout = setTimeout( this.props.onDismissClick!, this.props.duration! );
		}
	}

	getIcon(): string {
		let icon: string;

		switch ( this.props.status ) {
			case 'is-info':
				icon = 'info';
				break;
			case 'is-success':
				icon = 'checkmark';
				break;
			case 'is-error':
				icon = 'notice';
				break;
			case 'is-warning':
			case 'is-transparent-info':
				icon = 'notice';
				break;
			default:
				icon = 'info';
				break;
		}

		return icon;
	}

	render(): ReactNode {
		const {
			children,
			className,
			icon,
			isCompact,
			isLoading,
			onDismissClick,
			showDismiss = ! isCompact,
			status,
			text,
			translate,
			theme = 'dark',
		} = this.props;

		const classes = clsx( 'notice', status, className, {
			'is-compact': isCompact,
			'is-loading': isLoading,
			'is-dismissable': showDismiss,
			/**
			 * The default scss styling of this component is of theme dark
			 * and we only have 1 override theme which is the light theme
			 */
			'is-light': theme === 'light',
		} );

		let iconNeedsDrop = false;
		let renderedIcon: ReactNode = null;

		if ( icon && isValidElement( icon ) ) {
			renderedIcon = icon;
		} else {
			const iconName = icon || this.getIcon();
			renderedIcon = <Gridicon className="notice__icon" icon={ iconName as string } size={ 24 } />;
			iconNeedsDrop = GRIDICONS_WITH_DROP.includes(
				iconName as ( typeof GRIDICONS_WITH_DROP )[ number ]
			);
		}

		return (
			<div className={ classes } role="status" aria-label={ translate( 'Notice' ) }>
				<span className="notice__icon-wrapper">
					{ iconNeedsDrop && <span className="notice__icon-wrapper-drop" /> }
					{ renderedIcon }
				</span>
				<span className="notice__content">
					<span className="notice__text">{ text ? text : children }</span>
				</span>
				{ text ? children : null }
				{ showDismiss && (
					<button
						className="notice__dismiss"
						onClick={ onDismissClick }
						aria-label={ translate( 'Dismiss' ) }
					>
						<Gridicon icon="cross" size={ 24 } />
					</button>
				) }
			</div>
		);
	}
}

export default localize( Notice );
