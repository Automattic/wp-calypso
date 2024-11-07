/**
 * @jest-environment jsdom
 */

import { ValidationErrors } from 'calypso/lib/media/constants';
import { MediaLibraryContent } from 'calypso/my-sites/media-library/content';
import mediaReducer from 'calypso/state/media/reducer';
import { reducer as uiReducer } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { ui: uiReducer, media: mediaReducer } } );

jest.mock( 'calypso/sites/marketing/connections/inline-connection', () => () => null );

const googleConnection = {
	service: 'google_photos',
	status: 'ok',
};

const googleConnectionInvalid = {
	service: 'google_photos',
	status: 'invalid',
};

const mediaValidationErrorTypes = [ ValidationErrors.SERVICE_AUTH_FAILED ];

const defaultProps = {
	filterRequiresUpgrade: false,
	mediaScale: 1,
	mediaValidationErrorTypes: [],
	selectedItems: [],
	site: { ID: 123456789 },
	translate: () => {},
};

describe( 'MediaLibraryContent', () => {
	let originalScrollTo;

	beforeAll( () => {
		originalScrollTo = window.scrollTo;
		window.scrollTo = () => null;
	} );

	afterAll( () => {
		window.scrollTo = originalScrollTo;
	} );

	describe( 'isGoogleConnectedAndVisible', () => {
		test( 'returns true when connected using google source', () => {
			const props = {
				googleConnection,
				source: 'google_photos',
			};
			const content = new MediaLibraryContent();

			expect( content.isGoogleConnectedAndVisible( props ) ).toBe( true );
		} );

		test( 'returns false when not connected and using google source', () => {
			const props = {
				googleConnection,
				source: '',
			};
			const content = new MediaLibraryContent();

			expect( content.isGoogleConnectedAndVisible( props ) ).toBe( false );
		} );

		test( 'returns false when using google source and not connected', () => {
			const props = {
				googleConnection: null,
				source: 'google_photos',
			};
			const content = new MediaLibraryContent();

			expect( content.isGoogleConnectedAndVisible( props ) ).toBe( false );
		} );
	} );

	describe( 'hasGoogleExpired', () => {
		test( 'returns false when no media errors and google service', () => {
			const props = {
				mediaValidationErrorTypes: [],
				source: 'google_photos',
			};
			const content = new MediaLibraryContent();

			expect( content.hasGoogleExpired( props ) ).toBe( false );
		} );

		test( 'returns false when media errors and not google service', () => {
			const props = {
				mediaValidationErrorTypes,
				source: '',
			};
			const content = new MediaLibraryContent();

			expect( content.hasGoogleExpired( props ) ).toBe( false );
		} );

		test( 'returns true when media errors and google service', () => {
			const props = {
				mediaValidationErrorTypes,
				source: 'google_photos',
			};
			const content = new MediaLibraryContent();

			expect( content.hasGoogleExpired( props ) ).toBe( true );
		} );
	} );

	describe( 'needsToBeConnected', () => {
		test( 'returns false when default service and not connected', () => {
			const props = {
				source: '',
				mediaValidationErrorTypes,
				isConnected: false,
				googleConnection: null,
			};
			const content = new MediaLibraryContent( props );

			expect( content.needsToBeConnected() ).toBe( false );
		} );

		test( 'returns false when google service, connected, and not expired', () => {
			const props = {
				source: 'google_photos',
				mediaValidationErrorTypes: [],
				isConnected: true,
				googleConnection,
			};
			const content = new MediaLibraryContent( props );

			expect( content.needsToBeConnected() ).toBe( false );
		} );

		test( 'returns false when not google service, is connected, and expired', () => {
			const props = {
				source: 'example',
				mediaValidationErrorTypes,
				isConnected: true,
				googleConnection,
			};
			const content = new MediaLibraryContent( props );

			expect( content.needsToBeConnected() ).toBe( false );
		} );

		test( 'returns true when google service, not connected, and expired', () => {
			const props = {
				source: 'google_photos',
				mediaValidationErrorTypes,
				isConnected: false,
				googleConnection,
			};
			const content = new MediaLibraryContent( props );

			expect( content.needsToBeConnected() ).toBe( true );
		} );

		test( 'returns true when google service, not connected, and not expired', () => {
			const props = {
				source: 'google_photos',
				mediaValidationErrorTypes: [],
				isConnected: false,
				googleConnection,
			};
			const content = new MediaLibraryContent( props );

			expect( content.needsToBeConnected() ).toBe( true );
		} );
	} );

	describe( 'componentDidUpdate', () => {
		test( 'deleteKeyringConnection issued when google service goes from ok to expired', () => {
			const deleteKeyringConnection = jest.fn();
			const props = {
				source: 'google_photos',
				isConnected: true,
				googleConnection,
				deleteKeyringConnection,
			};
			const { rerender } = render( <MediaLibraryContent { ...defaultProps } { ...props } /> );

			rerender(
				<MediaLibraryContent
					{ ...defaultProps }
					{ ...props }
					mediaValidationErrorTypes={ mediaValidationErrorTypes }
				/>
			);

			expect( deleteKeyringConnection ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'deleteKeyringConnection not issued if no service expires', () => {
			const deleteKeyringConnection = jest.fn();
			const props = {
				source: 'google_photos',
				isConnected: true,
				googleConnection,
				deleteKeyringConnection,
			};
			const { rerender } = render( <MediaLibraryContent { ...defaultProps } { ...props } /> );

			rerender( <MediaLibraryContent { ...defaultProps } { ...props } /> );

			expect( deleteKeyringConnection ).toHaveBeenCalledTimes( 0 );
		} );

		test( 'sourceChanged issued when expired google service goes from invalid to ok', () => {
			const changeMediaSource = jest.fn();
			const propsBefore = {
				source: 'google_photos',
				isConnected: false,
				googleConnection: null,
				mediaValidationErrorTypes,
				changeMediaSource,
			};
			const propsAfter = {
				source: 'google_photos',
				isConnected: false,
				googleConnection,
				changeMediaSource,
				mediaValidationErrorTypes,
			};
			const { rerender } = render( <MediaLibraryContent { ...defaultProps } { ...propsBefore } /> );

			rerender( <MediaLibraryContent { ...defaultProps } { ...propsAfter } /> );
			expect( changeMediaSource ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'sourceChanged not issued when google service remains constant', () => {
			const changeMediaSource = jest.fn();

			const propsBefore = {
				source: 'google_photos',
				isConnected: false,
				googleConnection: googleConnectionInvalid,
				changeMediaSource,
			};
			const { rerender } = render( <MediaLibraryContent { ...defaultProps } { ...propsBefore } /> );

			changeMediaSource.mockReset();
			rerender( <MediaLibraryContent { ...defaultProps } { ...propsBefore } /> );

			expect( changeMediaSource ).toHaveBeenCalledTimes( 0 );
		} );
	} );
} );
