import { useTranslate } from 'i18n-calypso';
import React, { FC, ReactNode } from 'react';
import './style.scss';

interface Props {
	progress: ReactNode;
	children: ReactNode;
}

export const Sidebar: FC< Props > = ( { progress, children } ) => {
	const translate = useTranslate();

	return (
		<div className="migration-instructions-sidebar">
			<div className="migration-instructions-sidebar__progress">{ progress }</div>

			<h1 className="migration-instructions-sidebar__title">
				{ translate( 'Let’s migrate your site' ) }
			</h1>
			<p className="migration-instructions-sidebar__description">
				{ translate( 'Follow these steps to get started.' ) }
			</p>

			{ children }
		</div>
	);
};
