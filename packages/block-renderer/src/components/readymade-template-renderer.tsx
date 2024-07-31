import { memo } from 'react';
import { RenderedContent } from '../types';
import BlockRendererContainer from './block-renderer-container';

const ReadymadeTemplateRenderer = ( {
	renderedReadymadeTemplate,
	viewportWidth,
}: {
	renderedReadymadeTemplate: RenderedContent;
	viewportWidth: number;
} ) => {
	const readymadeTemplateStyles = renderedReadymadeTemplate?.styles ?? [];
	const readymadeTemplateScripts = renderedReadymadeTemplate?.scripts ?? '';

	return (
		<BlockRendererContainer
			styles={ readymadeTemplateStyles }
			scripts={ readymadeTemplateScripts }
			viewportWidth={ viewportWidth }
		>
			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ { __html: renderedReadymadeTemplate.html } }
			/>
		</BlockRendererContainer>
	);
};

export default memo( ReadymadeTemplateRenderer );
