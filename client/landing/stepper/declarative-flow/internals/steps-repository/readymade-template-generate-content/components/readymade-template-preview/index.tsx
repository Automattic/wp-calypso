import {
	BlockRendererProvider,
	ReadymadeTemplateRenderer,
	RenderedContent,
} from '@automattic/block-renderer';
import { Spinner } from '@wordpress/components';
import React from 'react';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/constants';
import './style.scss';

type RTPreviewProps = {
	renderedContent?: RenderedContent | null;
	isLoading?: boolean;
};

const ReadymadeTemplatePreview: React.FC< RTPreviewProps > = ( {
	renderedContent = null,
	isLoading = false,
} ) => {
	return (
		<div className="readymade-template-preview">
			{ ! renderedContent || isLoading ? (
				<Spinner />
			) : (
				<BlockRendererProvider siteId={ RENDERER_SITE_ID }>
					<ReadymadeTemplateRenderer
						renderedReadymadeTemplate={ renderedContent }
						viewportWidth={ 1200 }
					/>
				</BlockRendererProvider>
			) }
		</div>
	);
};

export default ReadymadeTemplatePreview;
