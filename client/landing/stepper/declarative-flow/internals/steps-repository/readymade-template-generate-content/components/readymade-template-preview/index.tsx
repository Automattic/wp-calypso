import {
	BlockRendererProvider,
	ReadymadeTemplateRenderer,
	RenderedContent,
} from '@automattic/block-renderer';
import { Spinner } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import React from 'react';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/constants';
import './style.scss';
import SitePreview from '../../../../components/site-preview';

type RTPreviewProps = {
	renderedContent?: RenderedContent;
	isLoading?: boolean;
	siteSlug?: string | null;
};

const ReadymadeTemplatePreview: React.FC< RTPreviewProps > = ( {
	renderedContent,
	isLoading = false,
	siteSlug = null,
} ) => {
	if ( isLoading ) {
		const loadingMessage = translate( '{{strong}}Generating content for your site.{{/strong}}', {
			components: { strong: <strong /> },
		} );
		return (
			<div className="readymade-template-preview">
				<Spinner />
				{ loadingMessage }
			</div>
		);
	}

	return siteSlug ? (
		<SitePreview siteSlug={ siteSlug } enableInteractions={ false } />
	) : (
		<div className="readymade-template-preview">
			<BlockRendererProvider siteId={ RENDERER_SITE_ID }>
				<ReadymadeTemplateRenderer
					renderedReadymadeTemplate={ renderedContent as RenderedContent }
					viewportWidth={ 1200 }
				/>
			</BlockRendererProvider>
		</div>
	);
};

export default ReadymadeTemplatePreview;
