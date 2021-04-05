/**
 * External dependencies
 */

import React, { useEffect, FunctionComponent } from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { TimerHandle } from 'calypso/types';

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

/**
 * Constants
 */
enum Status {
	Error = 'is-error',
	Info = 'is-info',
	Success = 'is-success',
	Warning = 'is-warning',
	Plain = 'is-plain',
}

interface Props {
	className?: string;
	duration?: number;
	onDismissClick: () => void;
	translate: ( x: string ) => string;
	children: React.ReactNode;
	status?: Status;
	icon?: string | null;
	isCompact?: boolean;
	isLoading?: boolean;
	showDismiss?: boolean;
	text?: string | React.ReactNode;
}

const getIcon = ( status: Status ): string => {
	let icon: string;

	switch ( status ) {
		case Status.Info:
			icon = 'info';
			break;
		case Status.Success:
			icon = 'checkmark';
			break;
		case Status.Error:
			icon = 'notice';
			break;
		case Status.Warning:
			icon = 'notice';
			break;
		default:
			icon = 'info';
			break;
	}

	return icon;
};

const Notice: FunctionComponent< Props > = ( {
	className = '',
	duration = 0,
	onDismissClick,
	translate,
	children,
	status = null,
	icon = null,
	isCompact = false,
	isLoading = false,
	showDismiss = ! isCompact,
	text = null,
} ) => {
	useEffect( () => {
		let dismissTimeout: TimerHandle | undefined = undefined;

		if ( dismissTimeout ) {
			clearTimeout( dismissTimeout );
		}

		if ( duration > 0 ) {
			dismissTimeout = setTimeout( onDismissClick, duration );
		}

		return () => {
			if ( dismissTimeout ) {
				clearTimeout( dismissTimeout );
			}
		};
	}, [ duration, onDismissClick ] );

	// showDismiss = ! isCompact, // by default, show on normal notices, don't show on compact ones

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

export default localize( Notice );
