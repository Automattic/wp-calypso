import clsx from 'clsx';
import PropTypes from 'prop-types';
import type { ReactNode } from 'react';

import './style.scss';

type LayoutProps = {
	children: ReactNode[];
	className: string;
};

export default function Layout( { children, className }: LayoutProps ) {
	const layoutClasses = clsx( 'layout-wrapper', className );

	return <div className={ layoutClasses }>{ children }</div>;
}

Layout.propTypes = {
	className: PropTypes.string,
};
