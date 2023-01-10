import validator from 'is-my-json-valid';
import { ABOUT_PAGE, CONTACT_PAGE, HOME_PAGE } from '../../../../../signup/difm/constants';
import { initialState, schema, WebsiteContentCollection } from '../schema';

const initialTestState: WebsiteContentCollection = {
	currentIndex: 0,
	websiteContent: {
		pages: [
			{
				id: HOME_PAGE,
				title: 'Homepage',
				content: '',
				media: [
					{ caption: '', url: '', mediaType: 'IMAGE', thumbnailUrl: '' },
					{ caption: '', url: '', mediaType: 'IMAGE', thumbnailUrl: '' },
					{ caption: '', url: '', mediaType: 'IMAGE', thumbnailUrl: '' },
					{ caption: '', url: '', mediaType: 'IMAGE', thumbnailUrl: '' },
				],
			},
			{
				id: ABOUT_PAGE,
				title: 'Information About You',
				content: '',
				media: [
					{ caption: '', url: '', mediaType: 'IMAGE', thumbnailUrl: '' },
					{ caption: '', url: '', mediaType: 'IMAGE', thumbnailUrl: '' },
					{ caption: '', url: '', mediaType: 'IMAGE', thumbnailUrl: '' },
					{ caption: '', url: '', mediaType: 'IMAGE', thumbnailUrl: '' },
				],
			},
			{
				id: CONTACT_PAGE,
				title: 'Contact Info',
				content: '',
				media: [
					{ caption: '', url: '', mediaType: 'IMAGE', thumbnailUrl: '' },
					{ caption: '', url: '', mediaType: 'IMAGE', thumbnailUrl: '' },
					{ caption: '', url: '', mediaType: 'IMAGE', thumbnailUrl: '' },
					{ caption: '', url: '', mediaType: 'IMAGE', thumbnailUrl: '' },
				],
			},
		],

		siteLogoSection: { siteLogoUrl: '' },
		feedbackSection: { genericFeedback: '' },
	},
	mediaUploadStates: {},
	siteId: 1337,
};

describe( 'schema', () => {
	test( 'Schema should be valid', () => {
		expect( () => {
			validator( schema );
		} ).not.toThrow();
	} );

	test( 'Empty object should be invalid', () => {
		const isValidSchema = validator( schema )( {} );
		expect( isValidSchema ).toBe( false );
	} );

	test( 'Initial state should be valid', () => {
		const validatorExecutor = validator( schema, {
			verbose: true,
		} );
		const isValidSchema = validatorExecutor( initialState );
		expect( isValidSchema ).toBe( true );
	} );

	test( 'The sample state for Tests should adhere to the schema', () => {
		const isValidSchema = validator( schema )( initialTestState );
		expect( isValidSchema ).toBe( true );
	} );
} );
