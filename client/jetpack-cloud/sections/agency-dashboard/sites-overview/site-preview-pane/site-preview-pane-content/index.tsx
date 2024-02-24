import { ReactNode } from 'react';

import './style.scss';

type Props = {
	children?: ReactNode;
};

export default function SitePreviewPaneContent( { children }: Props ) {
	return <div className="site-preview__content">{ children }</div>;
}
