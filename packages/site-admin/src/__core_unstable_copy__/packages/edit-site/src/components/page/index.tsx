/**
 * External dependencies
 */
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import { unstableResourceWarning } from '../../../../../debug';
import { NavigableRegion } from '../../../../interface/src';
import Header from './header';
import './style.scss'; // @Todo: different from core: not imported in this way

type PageProps = {
	title: string;
	subTitle?: string;
	actions?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
	hideTitleFromUI?: boolean;
};

export default function Page( {
	title,
	subTitle,
	actions,
	children,
	className,
	hideTitleFromUI = false,
}: PageProps ) {
	unstableResourceWarning(
		'<Page />',
		'https://github.com/WordPress/gutenberg/blob/d516b2350df88ccdb4ad10e00608b13c6ff7c6d8/packages/edit-site/src/components/page/index.js#L19'
	);
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
