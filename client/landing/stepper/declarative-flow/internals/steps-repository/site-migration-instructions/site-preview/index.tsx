import { useTranslate } from 'i18n-calypso';
import React, { FC } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import './style.scss';

export const SitePreview: FC = () => {
	const translate = useTranslate();
	const fromUrl = useQuery().get( 'from' ) || '';

	return (
		<div className="migration-instructions-from-preview">
			<iframe
				className="migration-instructions-from-preview__iframe"
				title={ translate( 'Preview of the site being imported' ) }
				src={ fromUrl }
			/>
		</div>
	);
};
