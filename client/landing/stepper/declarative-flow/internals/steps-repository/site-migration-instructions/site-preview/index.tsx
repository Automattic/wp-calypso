import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import React, { FC } from 'react';
import './style.scss';

const importSiteFrom = getQueryArg( window.location.href, 'from' )?.toString() || '';

export const SitePreview: FC = () => {
	const translate = useTranslate();

	return (
		<div className="migration-instructions-from-preview">
			<iframe
				className="migration-instructions-from-preview__iframe"
				title={ translate( 'Preview of the site being imported' ) }
				src={ importSiteFrom }
			/>
		</div>
	);
};
