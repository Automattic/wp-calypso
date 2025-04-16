/**
 * External dependencies
 */
import clsx from 'clsx';
import { NavigableRegion } from '../../interface';
/**
 * Internal dependencies
 */
import Header from './header';
import type { PageProps } from './types';
import './style.scss';

export function Page( {
	title,
	subTitle,
	actions,
	children,
	className,
	hideTitleFromUI = false,
}: PageProps ) {
	const classes = clsx( 'a8c-site-admin-page', className );

	return (
		<NavigableRegion className={ classes } ariaLabel={ title }>
			<div className="a8c-site-admin-page-content">
				{ ! hideTitleFromUI && title && (
					<Header title={ title } subTitle={ subTitle } actions={ actions } />
				) }
				{ children }
			</div>
		</NavigableRegion>
	);
}
