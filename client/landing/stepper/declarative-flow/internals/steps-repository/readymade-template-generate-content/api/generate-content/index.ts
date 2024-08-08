import wpcom from 'calypso/lib/wp';
import { ReadymadeTemplate } from 'calypso/my-sites/patterns/types';

const generateAIContentForTemplate = async (
	readymadeTemplate: ReadymadeTemplate,
	context: string
): Promise< ReadymadeTemplate > => {
	const paths = [
		{ content: readymadeTemplate.home.header, sectionName: 'Header' },
		{ content: readymadeTemplate.home.content, sectionName: 'Front Page Content' },
		{ content: readymadeTemplate.home.footer, sectionName: 'Footer' },
	];

	const requests = paths.map( ( { content, sectionName } ) =>
		wpcom.req.post( {
			path: '/ai-content/html',
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			body: {
				html: content,
				context: context,
				section_name: sectionName,
				section_description: `This is the ${ sectionName.toLowerCase() } of the site's frontpage`,
			},
		} )
	);

	try {
		const responses = await Promise.all( requests );
		return {
			...readymadeTemplate,
			home: {
				header: responses[ 0 ],
				content: responses[ 1 ],
				footer: responses[ 2 ],
			},
		};
	} catch ( error ) {
		return readymadeTemplate;
	}
};

export default generateAIContentForTemplate;
