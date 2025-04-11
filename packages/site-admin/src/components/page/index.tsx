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

type PageProps = {
	title: string;
	subTitle?: string;
	actions?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
	hideTitleFromUI?: boolean;
};

export function Page( {
	title,
	subTitle,
	actions,
	children,
	className,
	hideTitleFromUI = false,
}: PageProps ) {
	const classes = clsx( 'edit-site-page', className );

	return (
		<NavigableRegion className={ classes } ariaLabel={ title }>
			<div className="edit-site-page-content">
				{ ! hideTitleFromUI && title && (
					<Header title={ title } subTitle={ subTitle } actions={ actions } />
				) }
				{ children }
			</div>
		</NavigableRegion>
	);
}
