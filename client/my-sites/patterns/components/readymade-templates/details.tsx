import { PatternsGetStarted } from 'calypso/my-sites/patterns/components/get-started';
import { useReadymadeTemplates } from 'calypso/my-sites/patterns/hooks/use-readymade-templates';
import { ReadymadeTemplateDetailsFC } from 'calypso/my-sites/patterns/types';

export const ReadymadeTemplateDetails: ReadymadeTemplateDetailsFC = ( { id } ) => {
	const { data: readymadeTemplates = [] } = useReadymadeTemplates();
	if ( ! readymadeTemplates.length ) {
		return null;
	}

	const readymadeTemplate = readymadeTemplates.find( ( rt ) => rt.template_id === id );
	if ( ! readymadeTemplate ) {
		return null;
	}

	return (
		<>
			<div className="readymade-template-details">
				<button>Back to patterns</button>
				<h1>{ readymadeTemplate.title }</h1>
			</div>
			<PatternsGetStarted />
		</>
	);
};
