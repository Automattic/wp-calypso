import { useTranslate } from 'i18n-calypso';
import React, { FC, ReactNode } from 'react';
import './style.scss';

export const Sidebar: FC< { children: ReactNode } > = ( { children } ) => {
	const translate = useTranslate();

	return (
		<div className="migration-instructions-sidebar">
			<h1 className="migration-instructions-sidebar__title">
				{ translate( 'Let’s migrate your site' ) }
			</h1>
			<p className="migration-instructions-sidebar__description">
				{ translate( 'Follow these steps to get started.' ) }
			</p>
			[CHECKLIST HERE]
			{ children }
		</div>
	);
};
