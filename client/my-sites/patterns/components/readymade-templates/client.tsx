import {
	PatternRenderer,
	BlockRendererProvider,
	PatternsRendererContext,
} from '@automattic/block-renderer';
import { ReadymadeTemplatesSection } from 'calypso/my-sites/patterns/components/readymade-templates/section';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/constants';
import { useRenderReadymadeTemplate } from 'calypso/my-sites/patterns/hooks/use-render-readymade-template';
import { ReadymadeTemplate, ReadymadeTemplatesFC } from 'calypso/my-sites/patterns/types';

const ReadymadeTemplatePreview = ( readymadeTemplate: ReadymadeTemplate ) => {
	const { data: renderedPatterns = {} } = useRenderReadymadeTemplate( readymadeTemplate );

	return (
		<PatternsRendererContext.Provider value={ { renderedPatterns, shouldShufflePosts: false } }>
			{ Object.keys( renderedPatterns ).map( ( pattern ) => (
				<PatternRenderer patternId={ pattern } viewportWidth={ 1200 } key={ pattern } />
			) ) }
		</PatternsRendererContext.Provider>
	);
};

export const ReadymadeTemplatesClient: ReadymadeTemplatesFC = ( { readymadeTemplates } ) => (
	<BlockRendererProvider siteId={ RENDERER_SITE_ID }>
		<ReadymadeTemplatesSection
			readymadeTemplates={ readymadeTemplates }
			renderPreview={ ReadymadeTemplatePreview }
		/>
	</BlockRendererProvider>
);
