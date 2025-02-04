import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

type Props = {
	children?: ReactNode;
	className?: string;
};

export default function SitePreviewPaneContent( { children, className }: Props ) {
	return <div className={ clsx( 'site-preview__content', className ) }>{ children }</div>;
}
