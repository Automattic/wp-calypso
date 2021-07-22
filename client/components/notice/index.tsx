/**
 * External dependencies
 */
import React, { useEffect, FunctionComponent, useRef } from 'react';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { TimerHandle } from 'calypso/types';
import Gridicon from 'calypso/components/gridicon';
import { NoticeStatus, NoticeText } from './types';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Module constants
 */
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
];

interface Props {
	className?: string;
	duration?: number;
	onDismissClick: () => void;
	children: React.ReactNode;
	status?: NoticeStatus;
	icon?: string | null;
	isCompact?: boolean;
	isLoading?: boolean;
	showDismiss?: boolean;
	text?: NoticeText;
}

const getIcon = ( status: NoticeStatus ): string => {
	switch ( status ) {
		case 'is-info':
			return 'info';
		case 'is-success':
			return 'checkmark';
		case 'is-error':
			return 'notice';
		case 'is-warning':
			return 'notice';
		case 'is-plain':
			return 'info';
		default:
			return 'info';
	}
};

const Notice: FunctionComponent< Props > = ( {
	className,
	duration = 0,
	onDismissClick,
	children,
	status,
	icon,
	isCompact = false,
	isLoading = false,
	showDismiss = ! isCompact, // by default, show on normal notices, don't show on compact ones
	text,
} ) => {
	const translate = useTranslate();
	const dismissTimeout = useRef< TimerHandle | null >( null );

	useEffect( () => {
		if ( duration > 0 ) {
			dismissTimeout.current = setTimeout( onDismissClick, duration );
		}

		return () => {
			if ( dismissTimeout.current ) {
				clearTimeout( dismissTimeout.current );
			}
		};
	}, [ duration, onDismissClick ] );

	const classes = classnames( 'notice', status, className, {
		'is-compact': isCompact,
		'is-loading': isLoading,
		'is-dismissable': showDismiss,
	} );

	const iconName = icon || getIcon( status );
	const iconNeedsDrop = GRIDICONS_WITH_DROP.includes( iconName );

	return (
		<div className={ classes }>
			<span className="notice__icon-wrapper">
				{ iconNeedsDrop && <span className="notice__icon-wrapper-drop" /> }
				<Gridicon className="notice__icon" icon={ iconName } size={ 24 } />
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
};

export default Notice;
