import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React, { FC, ReactNode } from 'react';
import './style.scss';

interface Props {
	progress: ReactNode;
	withPreview?: boolean;
	children: ReactNode;
}

export const MigrationInstructions: FC< Props > = ( {
	progress,
	withPreview = false,
	children,
} ) => {
	const translate = useTranslate();

	return (
		<div
			className={ clsx( 'migration-instructions', {
				'migration-instructions--with-preview': withPreview,
			} ) }
		>
			<div className="migration-instructions__progress">{ progress }</div>

			<div className="migration-instructions__content">
				<h1 className="migration-instructions__title">
					{ translate( 'Let’s migrate your site' ) }
				</h1>
				<p className="migration-instructions__description">
					{ translate( 'Follow these steps to get started:' ) }
				</p>

				{ children }
			</div>
		</div>
	);
};
