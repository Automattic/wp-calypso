import classNames from 'classnames';
import { ReactNode } from 'react';

import './style.scss';

type Props = {
	children?: ReactNode;
	className?: string;
};

export default function ItemPreviewPaneContent( { children, className }: Props ) {
	return <div className={ classNames( 'item-preview__content', className ) }>{ children }</div>;
}
