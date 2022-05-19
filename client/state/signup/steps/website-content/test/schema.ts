import validator from 'is-my-json-valid';
import { initialState, schema } from '../schema';

const initialTestState = {
	currentIndex: 0,

	websiteContent: {
		siteLogoUrl: '',
		pages: [
			{
				id: 'Home',
				title: 'Homepage',
				content: '',
				images: [
					{ caption: '', url: '' },
					{ caption: '', url: '' },
					{ caption: '', url: '' },
				],
			},
			{
				id: 'About',
				title: 'Information About You',
				content: '',
				images: [
					{ caption: '', url: '' },
					{ caption: '', url: '' },
					{ caption: '', url: '' },
				],
			},
			{
				id: 'Contact',
				title: 'Contact Info',
				content: '',
				images: [
					{ caption: '', url: '' },
					{ caption: '', url: '' },
					{ caption: '', url: '' },
				],
			},
		],
	},
};

describe( 'schema', () => {
	test( 'Schema should be valid', () => {
		expect( () => {
			validator( schema );
		} ).not.toThrow();
	} );

	test( 'Empty schema should be invalid', () => {
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
