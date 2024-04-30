import { ReactNode } from 'react';

import './style.scss';

type Props = {
	children?: ReactNode;
	className?: string;
};

export default function ItemPreviewPaneContent( { children }: Props ) {
	return <div className="item-preview__content">{ children }</div>;
}
