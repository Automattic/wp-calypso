import { assert } from 'chai';
import validator from 'is-my-json-valid';
import { initialState, schema } from '../schema';

const initialTestState = {
	currentIndex: 0,
	websiteContent: [
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
};

describe( 'schema', () => {
	test( 'Schema should be valid', () => {
		assert.doesNotThrow( () => {
			validator( schema );
		}, Error );
	} );

	test( 'Empty schema should be invalid', () => {
		const isValidSchema = validator( schema )( {} );
		assert.isFalse( isValidSchema );
	} );

	test( 'Initial state should be valid', () => {
		const isValidSchema = validator( schema )( initialState );
		assert.isTrue( isValidSchema );
	} );

	test( 'The sample state for Tests should adhere to the schema', () => {
		const isValidSchema = validator( schema )( initialTestState );
		assert.isTrue( isValidSchema );
	} );
} );
