/**
 * @jest-environment jsdom
 */
import { shallow } from 'enzyme';
import { EditGravatar } from 'calypso/blocks/edit-gravatar';
import ImageEditor from 'calypso/blocks/image-editor';
import DropZone from 'calypso/components/drop-zone';
import VerifyEmailDialog from 'calypso/components/email-verification/email-verification-dialog';
import FilePicker from 'calypso/components/file-picker';
import Gravatar from 'calypso/components/gravatar';
import { AspectRatios } from 'calypso/state/editor/image-editor/constants';

jest.mock( 'event', () => require( 'component-event' ), { virtual: true } );
jest.mock( 'calypso/lib/oauth-token', () => ( {
	getToken: () => 'bearerToken',
} ) );

const noop = () => {};

describe( 'EditGravatar', () => {
	let originalUrl;
	const user = {
		email_verified: false,
	};

	beforeAll( () => {
		originalUrl = global.URL;
		global.URL = {
			revokeObjectURL: jest.fn(),
			createObjectURL: jest.fn(),
		};
	} );

	afterAll( () => {
		global.URL = originalUrl;
	} );

	describe( 'component rendering', () => {
		test( 'displays a Gravatar', () => {
			const wrapper = shallow( <EditGravatar translate={ noop } user={ user } /> );
			expect( wrapper.find( Gravatar ).length ).toEqual( 1 );
		} );

		test( 'contains a file picker that accepts images', () => {
			const wrapper = shallow( <EditGravatar translate={ noop } user={ user } /> );
			const filePicker = wrapper.find( FilePicker );
			expect( filePicker.length ).toEqual( 1 );
			expect( filePicker.prop( 'accept' ) ).toEqual( 'image/*' );
		} );

		test( 'does not display the image editor by default', () => {
			const wrapper = shallow( <EditGravatar translate={ noop } user={ user } /> );
			expect( wrapper.find( ImageEditor ).length ).toEqual( 0 );
		} );

		describe( 'drag and drop', () => {
			test( 'does not contain a drop zone for unverified users', () => {
				const wrapper = shallow(
					<EditGravatar
						translate={ noop }
						user={ {
							email_verified: false,
						} }
					/>
				);
				expect( wrapper.find( DropZone ) ).toHaveLength( 0 );
			} );

			test( 'contains a drop zone for verified users', () => {
				const wrapper = shallow(
					<EditGravatar
						translate={ noop }
						user={ {
							email_verified: true,
						} }
					/>
				);
				expect( wrapper.find( DropZone ) ).toHaveLength( 1 );
			} );
		} );
	} );

	describe( 'getting a file from user', () => {
		describe( 'accepted file type', () => {
			test( 'displays the image editor with square allowed aspect ratio', () => {
				const wrapper = shallow(
					<EditGravatar translate={ noop } user={ user } recordReceiveImageEvent={ noop } />
				);
				const files = [
					{
						name: 'filename.png',
					},
				];

				wrapper.instance().onReceiveFile( files );

				const imageEditor = wrapper.update().find( ImageEditor );
				expect( imageEditor.length ).toEqual( 1 );

				const aspectRatioResult = imageEditor.prop( 'allowedAspectRatios' );
				expect( aspectRatioResult ).toEqual( [ AspectRatios.ASPECT_1X1 ] );
			} );
		} );

		describe( 'bad file type', () => {
			test( 'does not display editor, and calls error action creator', () => {
				const receiveGravatarImageFailedSpy = jest.fn();
				const wrapper = shallow(
					<EditGravatar
						receiveGravatarImageFailed={ receiveGravatarImageFailedSpy }
						translate={ noop }
						user={ user }
						recordReceiveImageEvent={ noop }
					/>
				);
				const files = [
					{
						name: 'filename.tiff',
					},
				];

				wrapper.instance().onReceiveFile( files );

				expect( wrapper.update().find( ImageEditor ).length ).toEqual( 0 );
				expect( receiveGravatarImageFailedSpy ).toHaveBeenCalledTimes( 1 );
			} );
		} );
	} );

	describe( 'after editing image', () => {
		const imageEditorProps = {
			resetAllImageEditorState: noop,
		};
		const files = [
			{
				name: 'filename.png',
			},
		];

		test( 'given no error, hides image editor and calls upload gravatar action creator', () => {
			const receiveGravatarImageFailedSpy = jest.fn();
			const uploadGravatarSpy = jest.fn();
			const wrapper = shallow(
				<EditGravatar
					receiveGravatarImageFailed={ receiveGravatarImageFailedSpy }
					resetAllImageEditorState={ noop }
					translate={ noop }
					uploadGravatar={ uploadGravatarSpy }
					user={ user }
					recordReceiveImageEvent={ noop }
				/>
			);

			wrapper.instance().onReceiveFile( files );
			wrapper.instance().onImageEditorDone( null, 'image', imageEditorProps );

			expect( wrapper.update().find( ImageEditor ).length ).toEqual( 0 );
			expect( uploadGravatarSpy ).toHaveBeenCalledTimes( 1 );
			expect( receiveGravatarImageFailedSpy.mock.calls ).toHaveLength( 0 );
		} );

		test( 'given an error, hides image editor and calls error notice action creator', () => {
			const error = new Error();
			const receiveGravatarImageFailedSpy = jest.fn();
			const uploadGravatarSpy = jest.fn();
			const wrapper = shallow(
				<EditGravatar
					receiveGravatarImageFailed={ receiveGravatarImageFailedSpy }
					resetAllImageEditorState={ noop }
					translate={ noop }
					uploadGravatar={ uploadGravatarSpy }
					user={ user }
					recordReceiveImageEvent={ noop }
				/>
			);

			wrapper.instance().onReceiveFile( files );
			wrapper.instance().onImageEditorDone( error, 'image', imageEditorProps );

			expect( wrapper.update().find( ImageEditor ).length ).toEqual( 0 );
			expect( receiveGravatarImageFailedSpy ).toHaveBeenCalledTimes( 1 );
			expect( uploadGravatarSpy.mock.calls ).toHaveLength( 0 );
		} );
	} );

	describe( 'unverified user', () => {
		test( 'shows email verification dialog when clicked', () => {
			const wrapper = shallow(
				<EditGravatar translate={ noop } user={ user } recordClickButtonEvent={ noop } />
			);
			// Enzyme requires simulate() to be called directly on the element with the click handler
			const clickableWrapper = wrapper.find( '.edit-gravatar > div' ).first();

			clickableWrapper.simulate( 'click' );
			wrapper.update(); // make sure the state has been updated
			expect( wrapper.find( VerifyEmailDialog ) ).toHaveLength( 1 );
		} );
	} );
} );
