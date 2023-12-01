import classNames from 'classnames';
import { ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';

import './style.scss';

type Props = {
	children: ReactNode;
	className?: string;
	title: ReactNode;
	wide?: boolean;
	withBorder?: boolean;
};

export default function Layout( {
	children,
	className,
	title,
	wide = false,
	withBorder = false,
}: Props ) {
	return (
		<Main
			className={ classNames( 'jetpack-cloud-layout', className, {
				'is-with-border': withBorder,
			} ) }
			fullWidthLayout={ wide }
			wideLayout={ ! wide } // When we set to full width, we want to set this to false.
		>
			<DocumentHead title={ title } />

			<div className="jetpack-cloud-layout__container">{ children }</div>
		</Main>
	);
}
