import { ReadymadeTemplatesSection } from 'calypso/my-sites/patterns/components/readymade-templates/section';
import { ReadymadeTemplatesFC } from 'calypso/my-sites/patterns/types';

export const ReadymadeTemplatesServer: ReadymadeTemplatesFC = ( { readymadeTemplates } ) => (
	<ReadymadeTemplatesSection readymadeTemplates={ readymadeTemplates } />
);
