import wpcom from 'calypso/lib/wp';
import { ReadymadeTemplate } from 'calypso/my-sites/patterns/types';

const generateAIContentForTemplate = async (
	readymadeTemplate: ReadymadeTemplate,
	context: string,
	locale: string = 'en'
): Promise< ReadymadeTemplate > => {
	try {
		const response = await wpcom.req.post( {
			path: '/ai-content/html',
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			body: {
				html: readymadeTemplate.home.content,
				context: context,
				section_name: 'Website Frontpage',
				locale: locale,
				section_description: 'This is the front page of the site',
			},
		} );

		return {
			...readymadeTemplate,
			home: {
				...readymadeTemplate.home,
				content: response,
			},
		};
	} catch ( error ) {
		return readymadeTemplate;
	}
};

export default generateAIContentForTemplate;
