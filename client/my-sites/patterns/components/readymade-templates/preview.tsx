import { addQueryArgs } from '@wordpress/url';
import { ReadymadeTemplate } from 'calypso/my-sites/patterns/types';

export const ReadymadeTemplatePreview = ( {
	readymadeTemplate,
}: {
	readymadeTemplate: ReadymadeTemplate;
} ) => {
	const previewUrl = addQueryArgs( 'https://dotcompatterns.wordpress.com', {
		readymade_templates: readymadeTemplate.slug,
		iframe: true,
		theme_preview: true,
		preview: true,
	} );

	return (
		<iframe scrolling="no" title={ readymadeTemplate.title } src={ previewUrl } tabIndex={ -1 } />
	);
};
