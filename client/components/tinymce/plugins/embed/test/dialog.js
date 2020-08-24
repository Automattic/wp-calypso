/**
 * External dependencies
 */
import React from 'react';
import { assert } from 'chai';
import { shallow } from 'enzyme';
import { identity, noop } from 'lodash';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import FormTextInput from 'components/forms/form-text-input';

const testSiteId = 5089392;

describe( 'EmbedDialog', () => {
	let EmbedDialog;
	beforeAll( () => {
		jest.mock( 'lib/wp', () => ( {
			undocumented: () => ( {
				site: () => ( {
					embeds: () => {},
				} ),
			} ),
		} ) );

		EmbedDialog = require( '../dialog' ).EmbedDialog;
	} );
	test( 'should render', () => {
		const url = 'https://www.youtube.com/watch?v=JkOIhs2mHpc';
		const wrapper = shallow(
			<EmbedDialog
				embedUrl={ url }
				siteId={ testSiteId }
				onCancel={ noop }
				onUpdate={ noop }
				translate={ identity }
			/>
		);

		assert.isFalse( wrapper.instance().props.isVisible );
		assert.strictEqual( wrapper.find( '.embed__title' ).length, 1 );
		assert.strictEqual( wrapper.find( FormTextInput ).length, 1 );
		assert.strictEqual( wrapper.find( FormTextInput ).get( 0 ).props.defaultValue, url );
	} );

	test( 'should update embedUrl state when Embed URL input changes', () => {
		const originalUrl = 'https://www.youtube.com/watch?v=ghrL82cc-ss';
		const newUrl = 'https://videopress.com/v/DNgJlco8';
		const wrapper = shallow(
			<EmbedDialog
				embedUrl={ originalUrl }
				siteId={ testSiteId }
				onCancel={ noop }
				onUpdate={ noop }
				translate={ identity }
			/>
		);
		const mockChangeEvent = {
			target: { value: newUrl },
		};

		const inputField = wrapper.find( FormTextInput ).get( 0 );

		assert.strictEqual( inputField.props.defaultValue, originalUrl );
		wrapper.find( FormTextInput ).simulate( 'change', mockChangeEvent );

		assert.strictEqual( wrapper.state().embedUrl, newUrl );
	} );

	test( 'should return the new url to onUpdate when updating', () => {
		const originalUrl = 'https://www.youtube.com/watch?v=R54QEvTyqO4';
		const newUrl = 'https://videopress.com/v/x4IYthy7';
		const mockChangeEvent = {
			target: { value: newUrl },
		};
		let currentUrl = originalUrl;
		const onUpdate = ( url ) => {
			currentUrl = url;
		};
		const wrapper = shallow(
			<EmbedDialog
				embedUrl={ originalUrl }
				siteId={ testSiteId }
				onCancel={ noop }
				onUpdate={ onUpdate }
				translate={ identity }
			/>
		);

		assert.strictEqual( currentUrl, originalUrl );
		wrapper.find( FormTextInput ).simulate( 'change', mockChangeEvent );
		wrapper.instance().onUpdate();
		assert.strictEqual( currentUrl, newUrl );
	} );

	test( 'should not return the new url to onUpdate when canceling', () => {
		const originalUrl = 'https://www.youtube.com/watch?v=JkOIhs2mHpc';
		const newUrl = 'https://videopress.com/v/GtWYbzhZ';
		const mockChangeEvent = {
			target: { value: newUrl },
		};
		const noopSpy = spy( noop );
		let currentUrl = originalUrl;
		const onUpdate = ( url ) => {
			currentUrl = url;
		};
		const wrapper = shallow(
			<EmbedDialog
				embedUrl={ originalUrl }
				siteId={ testSiteId }
				onCancel={ noopSpy }
				onUpdate={ onUpdate }
				translate={ identity }
			/>
		);

		assert.strictEqual( currentUrl, originalUrl );
		wrapper.find( FormTextInput ).simulate( 'change', mockChangeEvent );
		assert.isFalse( noopSpy.called );
		wrapper.find( Dialog ).simulate( 'cancel' );
		assert.isTrue( noopSpy.called );
		assert.strictEqual( currentUrl, originalUrl );
	} );

	describe( 'EmbedDialog parseEmbedEndpointResult', () => {
		let wrapper, instance;
		const url = 'https://www.youtube.com/watch?v=JkOIhs2mHpc';

		beforeEach( () => {
			wrapper = shallow(
				<EmbedDialog
					embedUrl={ url }
					siteId={ testSiteId }
					onCancel={ noop }
					onUpdate={ noop }
					translate={ identity }
				/>
			);

			instance = wrapper.instance();
		} );

		test( 'should parse valid API result', () => {
			instance.state.previewMarkup = {};

			instance.parseEmbedEndpointResult( url )( null, { result: 123 } );

			assert.isUndefined( wrapper.state().previewMarkup[ url ].isError );
			assert.strictEqual( 123, wrapper.state().previewMarkup[ url ].result );
		} );

		test( 'should parse API error', () => {
			instance.state.previewMarkup = {};

			instance.parseEmbedEndpointResult( url )(
				{ error: 'invalid_embed_url', message: 'The embed_url parameter must be a valid URL.' },
				null
			);

			assert.isTrue( wrapper.state().previewMarkup[ url ].isError );
			assert.strictEqual(
				'invalid_embed_url',
				wrapper.state().previewMarkup[ url ].renderMarkup.error
			);
		} );

		test( 'should parse API error - no error message', () => {
			instance.state.previewMarkup = {};

			instance.parseEmbedEndpointResult( url )( { error: 'invalid_embed_url' }, null );

			assert.isTrue( wrapper.state().previewMarkup[ url ].isError );
			assert.strictEqual(
				'invalid_embed_url',
				wrapper.state().previewMarkup[ url ].renderMarkup.error
			);
			assert.strictEqual(
				'Unknown error',
				wrapper.state().previewMarkup[ url ].renderMarkup.message
			);
		} );

		test( 'should parse API layer error', () => {
			instance.state.previewMarkup = {};

			instance.parseEmbedEndpointResult( url )(
				null,
				{ error: 'custom_error', message: 'Custom error' },
				null
			);

			assert.isTrue( wrapper.state().previewMarkup[ url ].isError );
			assert.strictEqual( 'custom_error', wrapper.state().previewMarkup[ url ].renderMarkup );
		} );

		test( 'should parse transport error', () => {
			instance.state.previewMarkup = {};

			instance.parseEmbedEndpointResult( url )( null, null, { status: 0 } );

			assert.isTrue( wrapper.state().previewMarkup[ url ].isError );
			assert.strictEqual(
				'communication_error',
				wrapper.state().previewMarkup[ url ].renderMarkup.error
			);
		} );
	} );
} );
