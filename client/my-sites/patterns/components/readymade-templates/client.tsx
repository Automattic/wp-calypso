import { BlockRendererContainer, BlockRendererProvider } from '@automattic/block-renderer';
import { ReadymadeTemplatesSection } from 'calypso/my-sites/patterns/components/readymade-templates/section';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/constants';
import { ReadymadeTemplate, ReadymadeTemplatesFC } from 'calypso/my-sites/patterns/types';

const renderPreview = ( readymadeTemplate: ReadymadeTemplate ) => (
	<BlockRendererContainer viewportWidth={ 1200 }>
		<div
			// eslint-disable-next-line react/no-danger
			dangerouslySetInnerHTML={ { __html: readymadeTemplate.content } }
		/>
	</BlockRendererContainer>
);

export const ReadymadeTemplatesClient: ReadymadeTemplatesFC = ( { readymadeTemplates } ) => (
	<BlockRendererProvider siteId={ RENDERER_SITE_ID }>
		<ReadymadeTemplatesSection
			readymadeTemplates={ readymadeTemplates }
			renderPreview={ renderPreview }
		/>
	</BlockRendererProvider>
);
