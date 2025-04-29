import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, isValidElement, type ReactNode } from 'react';
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
	children?: ReactNode;
}

function getIcon( status: NoticeStatus | undefined ): string {
	switch ( status ) {
		case 'is-success':
			return 'checkmark';
		case 'is-error':
		case 'is-warning':
		case 'is-transparent-info':
			return 'notice';
		case 'is-info':
		default:
			return 'info';
	}
}

export default function Notice( {
	children,
	className,
	duration = 0,
	icon,
	isCompact = false,
	isLoading = false,
	onDismissClick,
	showDismiss = ! isCompact,
	status,
	text,
	theme = 'dark',
}: NoticeProps ) {
	const translate = useTranslate();

	const onDismissClickRef = useRef( onDismissClick );
	useEffect( () => {
		onDismissClickRef.current = onDismissClick;
	}, [ onDismissClick ] );

	useEffect( () => {
		if ( duration > 0 ) {
			const dismissTimeout = setTimeout( () => onDismissClickRef.current?.(), duration );
			return () => clearTimeout( dismissTimeout );
		}
	}, [ duration ] );

	const classes = clsx( 'calypso-notice', status, className, {
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
		const iconName = icon || getIcon( status );
		renderedIcon = (
			<Gridicon className="calypso-notice__icon" icon={ iconName as string } size={ 24 } />
		);
		iconNeedsDrop = GRIDICONS_WITH_DROP.includes(
			iconName as ( typeof GRIDICONS_WITH_DROP )[ number ]
		);
	}

	return (
		<div className={ classes } role="status" aria-label={ translate( 'Notice' ) }>
			<span className="calypso-notice__icon-wrapper">
				{ iconNeedsDrop && <span className="calypso-notice__icon-wrapper-drop" /> }
				{ renderedIcon }
			</span>
			<p className="calypso-notice__content">
				<span className="calypso-notice__text">{ text ? text : children }</span>
			</p>
			{ text ? children : null }
			{ showDismiss && (
				<button
					className="calypso-notice__dismiss"
					onClick={ onDismissClick }
					aria-label={ translate( 'Dismiss' ) }
				>
					<Gridicon icon="cross" size={ 24 } />
				</button>
			) }
		</div>
	);
}
