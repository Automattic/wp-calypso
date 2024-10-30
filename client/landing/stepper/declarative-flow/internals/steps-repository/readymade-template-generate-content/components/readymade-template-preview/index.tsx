import { Spinner } from '@wordpress/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import React from 'react';
import './style.scss';
import SitePreview from '../../../../components/site-preview';

type RTPreviewProps = {
	isLoading?: boolean;
	siteSlug?: string | null;
};

const ReadymadeTemplatePreview: React.FC< RTPreviewProps > = ( {
	isLoading = false,
	siteSlug = null,
} ) => {
	if ( isLoading ) {
		return (
			<div className={ clsx( 'readymade-template-preview', 'is-loading' ) }>
				<Spinner />
				<strong>{ translate( 'Generating content for your site.' ) }</strong>
			</div>
		);
	}

	return siteSlug ? <SitePreview siteSlug={ siteSlug } /> : null;
};

export default ReadymadeTemplatePreview;
