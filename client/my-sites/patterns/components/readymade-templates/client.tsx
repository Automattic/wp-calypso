import { BlockRendererProvider, ReadymadeTemplateRenderer } from '@automattic/block-renderer';
import { ReadymadeTemplatesSection } from 'calypso/my-sites/patterns/components/readymade-templates/section';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/constants';
import { useRenderReadymadeTemplate } from 'calypso/my-sites/patterns/hooks/use-render-readymade-template';
import { ReadymadeTemplate, ReadymadeTemplatesFC } from 'calypso/my-sites/patterns/types';

const ReadymadeTemplatePreview = ( {
	readymadeTemplate,
}: {
	readymadeTemplate: ReadymadeTemplate;
} ) => {
	const { data: renderedReadymadeTemplate = {} } = useRenderReadymadeTemplate( readymadeTemplate );

	return (
		<ReadymadeTemplateRenderer
			renderedReadymadeTemplate={ renderedReadymadeTemplate }
			viewportWidth={ 1200 }
		/>
	);
};

export const ReadymadeTemplatesClient: ReadymadeTemplatesFC = ( {
	readymadeTemplates,
	forwardRef,
} ) => (
	<BlockRendererProvider siteId={ RENDERER_SITE_ID }>
		<ReadymadeTemplatesSection
			readymadeTemplates={ readymadeTemplates }
			renderPreview={ ( template: ReadymadeTemplate ) => (
				<ReadymadeTemplatePreview readymadeTemplate={ template } />
			) }
			forwardRef={ forwardRef }
		/>
	</BlockRendererProvider>
);
