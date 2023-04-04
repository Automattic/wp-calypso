import { useTranslate } from 'i18n-calypso';
import React from 'react';
import FacebookLinkPreview from './link-preview';
import type { FacebookPreviewProps } from './types';

const FacebookPreview: React.FC< FacebookPreviewProps > = ( props ) => {
	const translate = useTranslate();

	return (
		<section>
			<h2>{ translate( 'Your post', { comment: 'Refers to a social post on Facebook' } ) }</h2>
			<p>{ translate( 'This is what your social post will look like on Facebook:' ) }</p>
			<FacebookLinkPreview { ...props } />
		</section>
	);
};

export default FacebookPreview;
