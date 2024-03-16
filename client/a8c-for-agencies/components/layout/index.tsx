import classNames from 'classnames';
import { ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';

import './style.scss';

type Props = {
	children: ReactNode;
	sidebarNavigation?: ReactNode;
	className?: string;
	title: ReactNode;
	wide?: boolean;
	withBorder?: boolean;
	compact?: boolean;
};

export default function Layout( {
	children,
	className,
	title,
	wide,
	withBorder,
	compact,
	sidebarNavigation,
}: Props ) {
	return (
		<Main
			className={ classNames( 'a4a-layout', className, {
				'is-with-border': withBorder,
				'is-compact': compact,
			} ) }
			fullWidthLayout={ wide }
			wideLayout={ ! wide } // When we set to full width, we want to set this to false.
		>
			<DocumentHead title={ title } />
			{ sidebarNavigation }

			<div className="a4a-layout__container">{ children }</div>
		</Main>
	);
}
