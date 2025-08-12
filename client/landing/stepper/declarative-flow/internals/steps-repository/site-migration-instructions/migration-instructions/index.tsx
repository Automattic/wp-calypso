import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React, { FC, ReactNode } from 'react';
import './style.scss';

interface Props {
	progress: ReactNode;
	withPreview?: boolean;
	children: ReactNode;
	isContainerV2?: boolean;
}

export const MigrationInstructions: FC< Props > = ( {
	progress,
	withPreview = false,
	children,
	isContainerV2 = false,
} ) => {
	const translate = useTranslate();

	return (
		<div
			className={ clsx( 'migration-instructions', {
				'migration-instructions--with-preview': withPreview,
				'migration-instructions--container-v2': isContainerV2,
			} ) }
		>
			{ ! isContainerV2 && <div className="migration-instructions__progress">{ progress }</div> }

			<div className="migration-instructions__content">
				{ ! isContainerV2 && (
					<h1 className="migration-instructions__title">
						{ translate( 'Let’s migrate your site' ) }
					</h1>
				) }
				<p className="migration-instructions__description">
					{ translate( 'Follow these steps to get started:' ) }
				</p>

				{ children }
			</div>
		</div>
	);
};
