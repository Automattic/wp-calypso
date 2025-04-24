/**
 * External dependencies
 */
import clsx from 'clsx';
import { NavigableRegion } from '../../interface';
/**
 * Internal dependencies
 */
import Header from './header';
import './style.scss';
/**
 * Types
 */
import type { PageProps } from './types';
import type { PropsWithChildren } from 'react';

export function Page( {
	title,
	subTitle,
	actions,
	children,
	className,
	hideTitleFromUI = false,
}: PropsWithChildren< PageProps > ) {
	const classes = clsx( 'a8c-site-admin-page', className );

	return (
		<NavigableRegion className={ classes } ariaLabel={ title }>
			<div className="a8c-site-admin-page__content">
				{ ! hideTitleFromUI && title && (
					<Header title={ title } subTitle={ subTitle } actions={ actions } />
				) }
				{ children }
			</div>
		</NavigableRegion>
	);
}
