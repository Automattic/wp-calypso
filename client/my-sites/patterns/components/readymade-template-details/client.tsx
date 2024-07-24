import { BlockRendererProvider, ReadymadeTemplateRenderer } from '@automattic/block-renderer';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/constants';
import { useRenderReadymadeTemplate } from 'calypso/my-sites/patterns/hooks/use-render-readymade-template';
import { ReadymadeTemplate } from 'calypso/my-sites/patterns/types';
import { ReadymadeTemplateDetails } from './index';

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

export const ReadymadeTemplateDetailsClient = ( { id }: { id: number } ) => {
	return (
		<BlockRendererProvider siteId={ RENDERER_SITE_ID }>
			<ReadymadeTemplateDetails
				id={ id }
				renderPreview={ ( template: ReadymadeTemplate ) => (
					<ReadymadeTemplatePreview readymadeTemplate={ template } />
				) }
			/>
		</BlockRendererProvider>
	);
};
