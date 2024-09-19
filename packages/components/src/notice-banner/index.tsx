import { alert } from '@automattic/components/src/icons';
import { Icon, warning, info, check, closeSmall } from '@wordpress/icons';
import clsx from 'clsx';
import React from 'react';
import './style.scss';

type NoticeBannerProps = {
	/** The severity of the alert. */
	level: 'error' | 'warning' | 'info' | 'success';

	/** The title of the NoticeBanner */
	title?: string;

	/** A list of action elements to show across the bottom */
	actions?: React.ReactNode[];

	/** Hide close button */
	hideCloseButton?: boolean;

	/** Method to call when the close button is clicked */
	onClose?: () => void;

	/** Children to be rendered inside the alert. */
	children: React.ReactNode;
};

const getIconByLevel = ( level: NoticeBannerProps[ 'level' ] ) => {
	switch ( level ) {
		case 'error':
			return alert;
		case 'warning':
			return info;
		case 'info':
			return info;
		case 'success':
			return check;
		default:
			return warning;
	}
};

export default function NoticeBanner( {
	level = 'info',
	title,
	children,
	actions,
	hideCloseButton = false,
	onClose,
}: NoticeBannerProps ) {
	return (
		<div className={ clsx( 'notice-banner', `is-${ level }` ) }>
			<div className="notice-banner__icon-wrapper">
				<Icon icon={ getIconByLevel( level ) } className="notice-banner__icon" />
			</div>

			<div className="notice-banner__main-content">
				{ title ? <div className="notice-banner__title">{ title }</div> : null }
				{ children }

				{ actions && actions.length > 0 && (
					<div className="notice-banner__action-bar">
						{ actions.map( ( action, index ) => (
							<div key={ index }>{ action }</div>
						) ) }
					</div>
				) }
			</div>

			{ ! hideCloseButton && (
				<button aria-label="close" className="notice-banner__close-button" onClick={ onClose }>
					<Icon icon={ closeSmall } />
				</button>
			) }
		</div>
	);
}
