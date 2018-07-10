/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PostPreviewButton } from '../';

describe( 'PostPreviewButton', () => {
	describe( 'setPreviewWindowLink()', () => {
		it( 'should do nothing if there is no preview window', () => {
			const url = 'https://wordpress.org';
			const setter = jest.fn();
			const wrapper = shallow( <PostPreviewButton /> );

			wrapper.instance().setPreviewWindowLink( url );

			expect( setter ).not.toHaveBeenCalled();
		} );

		it( 'set preview window location to url', () => {
			const url = 'https://wordpress.org';
			const setter = jest.fn();
			const wrapper = shallow( <PostPreviewButton /> );
			wrapper.instance().previewWindow = {
				get location() {
					return {
						href: 'about:blank',
					};
				},
				set location( value ) {
					setter( value );
				},
			};

			wrapper.instance().setPreviewWindowLink( url );

			expect( setter ).toHaveBeenCalledWith( url );
		} );
	} );

	describe( 'getWindowTarget()', () => {
		it( 'returns a string unique to the post id', () => {
			const instance = new PostPreviewButton( {
				postId: 1,
			} );

			expect( instance.getWindowTarget() ).toBe( 'wp-preview-1' );
		} );
	} );

	describe( 'componentDidUpdate()', () => {
		it( 'should change popup location if preview link is available', () => {
			const wrapper = shallow(
				<PostPreviewButton
					postId={ 1 }
					currentPostLink="https://wordpress.org/?p=1"
					isSaveable
					modified="2017-08-03T15:05:50" />
			);

			const previewWindow = { location: {} };

			wrapper.instance().previewWindow = previewWindow;

			wrapper.setProps( { previewLink: 'https://wordpress.org/?p=1' } );

			expect( previewWindow.location ).toBe( 'https://wordpress.org/?p=1' );
		} );
	} );

	describe( 'openPreviewWindow()', () => {
		function assertForPreview( props, expectedPreviewURL, isExpectingSave ) {
			const autosave = jest.fn();
			const preventDefault = jest.fn();
			const windowOpen = window.open;
			window.open = jest.fn( () => {
				return {
					document: {
						write: jest.fn(),
						close: jest.fn(),
					},
				};
			} );

			const wrapper = shallow(
				<PostPreviewButton
					postId={ 1 }
					{ ...props }
					autosave={ autosave }
				/>
			);

			wrapper.simulate( 'click', { preventDefault } );

			if ( expectedPreviewURL ) {
				expect( preventDefault ).toHaveBeenCalled();
				expect( window.open ).toHaveBeenCalledWith( expectedPreviewURL, 'wp-preview-1' );
			} else {
				expect( preventDefault ).not.toHaveBeenCalled();
				expect( window.open ).not.toHaveBeenCalled();
			}

			window.open = windowOpen;

			expect( autosave.mock.calls ).toHaveLength( isExpectingSave ? 1 : 0 );
			if ( isExpectingSave ) {
				expect( wrapper.instance().previewWindow.document.write ).toHaveBeenCalled();
			}

			return wrapper;
		}

		it( 'should do nothing if neither autosaveable nor preview link available', () => {
			assertForPreview( {
				isAutosaveable: false,
				previewLink: undefined,
			}, null, false );
		} );

		it( 'should save for autosaveable post with preview link', () => {
			assertForPreview( {
				isAutosaveable: true,
				previewLink: 'https://wordpress.org/?p=1&preview=true',
			}, 'about:blank', true );
		} );

		it( 'should save for autosaveable post without preview link', () => {
			assertForPreview( {
				isAutosaveable: true,
				previewLink: undefined,
			}, 'about:blank', true );
		} );

		it( 'should not save but open a popup window if not autosaveable but preview link available', () => {
			assertForPreview( {
				isAutosaveable: false,
				previewLink: 'https://wordpress.org/?p=1&preview=true',
			}, 'https://wordpress.org/?p=1&preview=true', false );
		} );
	} );

	describe( 'render()', () => {
		it( 'should render a link', () => {
			const wrapper = shallow(
				<PostPreviewButton
					postId={ 1 }
					isSaveable
					currentPostLink="https://wordpress.org/?p=1" />
			);

			expect( wrapper.prop( 'href' ) ).toBe( 'https://wordpress.org/?p=1' );
			expect( wrapper.prop( 'disabled' ) ).toBe( false );
			expect( wrapper.prop( 'target' ) ).toBe( 'wp-preview-1' );
		} );

		it( 'should be disabled if post is not saveable', () => {
			const wrapper = shallow(
				<PostPreviewButton
					postId={ 1 }
					currentPostLink="https://wordpress.org/?p=1" />
			);

			expect( wrapper.prop( 'disabled' ) ).toBe( true );
		} );
	} );
} );
