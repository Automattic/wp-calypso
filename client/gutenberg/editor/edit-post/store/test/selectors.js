/**
 * Internal dependencies
 */
import {
	getEditorMode,
	getPreference,
	isEditorSidebarOpened,
	isEditorSidebarPanelOpened,
	isFeatureActive,
	isPluginSidebarOpened,
	isPluginItemPinned,
	getMetaBoxes,
	hasMetaBoxes,
	isSavingMetaBoxes,
	getMetaBox,
} from '../selectors';

describe( 'selectors', () => {
	describe( 'getEditorMode', () => {
		it( 'should return the selected editor mode', () => {
			const state = {
				preferences: { editorMode: 'text' },
			};

			expect( getEditorMode( state ) ).toEqual( 'text' );
		} );

		it( 'should fallback to visual if not set', () => {
			const state = {
				preferences: {},
			};

			expect( getEditorMode( state ) ).toEqual( 'visual' );
		} );
	} );

	describe( 'getPreference', () => {
		it( 'should return the preference value if set', () => {
			const state = {
				preferences: { chicken: true },
			};

			expect( getPreference( state, 'chicken' ) ).toBe( true );
		} );

		it( 'should return undefined if the preference is unset', () => {
			const state = {
				preferences: { chicken: true },
			};

			expect( getPreference( state, 'ribs' ) ).toBeUndefined();
		} );

		it( 'should return the default value if provided', () => {
			const state = {
				preferences: {},
			};

			expect( getPreference( state, 'ribs', 'chicken' ) ).toEqual( 'chicken' );
		} );
	} );

	describe( 'isEditorSidebarOpened', () => {
		it( 'should return false when the editor sidebar is not opened', () => {
			const state = {
				preferences: {
					activeGeneralSidebar: null,
				},
			};

			expect( isEditorSidebarOpened( state ) ).toBe( false );
		} );

		it( 'should return false when the plugin sidebar is opened', () => {
			const state = {
				preferences: {
					activeGeneralSidebar: 'my-plugin/my-sidebar',
				},
			};

			expect( isEditorSidebarOpened( state ) ).toBe( false );
		} );

		it( 'should return true when the editor sidebar is opened', () => {
			const state = {
				preferences: {
					activeGeneralSidebar: 'edit-post/document',
				},
			};

			expect( isEditorSidebarOpened( state ) ).toBe( true );
		} );
	} );

	describe( 'isPluginSidebarOpened', () => {
		it( 'should return false when the plugin sidebar is not opened', () => {
			const state = {
				preferences: {
					activeGeneralSidebar: null,
				},
			};

			expect( isPluginSidebarOpened( state ) ).toBe( false );
		} );

		it( 'should return false when the editor sidebar is opened', () => {
			const state = {
				preferences: {
					activeGeneralSidebar: 'edit-post/document',
				},
			};

			expect( isPluginSidebarOpened( state ) ).toBe( false );
		} );

		it( 'should return true when the plugin sidebar is opened', () => {
			const name = 'plugin-sidebar/my-plugin/my-sidebar';
			const state = {
				preferences: {
					activeGeneralSidebar: name,
				},
			};

			expect( isPluginSidebarOpened( state ) ).toBe( true );
		} );
	} );

	describe( 'isEditorSidebarPanelOpened', () => {
		it( 'should return false if no panels preference', () => {
			const state = {
				preferences: {},
			};

			expect( isEditorSidebarPanelOpened( state, 'post-taxonomies' ) ).toBe( false );
		} );

		it( 'should return false if the panel value is not set', () => {
			const state = {
				preferences: { panels: {} },
			};

			expect( isEditorSidebarPanelOpened( state, 'post-taxonomies' ) ).toBe( false );
		} );

		it( 'should return the panel value', () => {
			const state = {
				preferences: { panels: { 'post-taxonomies': true } },
			};

			expect( isEditorSidebarPanelOpened( state, 'post-taxonomies' ) ).toBe( true );
		} );
	} );

	describe( 'isFeatureActive', () => {
		it( 'should return true if feature is active', () => {
			const state = {
				preferences: {
					features: {
						chicken: true,
					},
				},
			};

			expect( isFeatureActive( state, 'chicken' ) ).toBe( true );
		} );

		it( 'should return false if feature is not active', () => {
			const state = {
				preferences: {
					features: {
						chicken: false,
					},
				},
			};

			expect( isFeatureActive( state, 'chicken' ) ).toBe( false );
		} );

		it( 'should return false if feature is not referred', () => {
			const state = {
				preferences: {
					features: {
					},
				},
			};

			expect( isFeatureActive( state, 'chicken' ) ).toBe( false );
		} );
	} );

	describe( 'isPluginItemPinned', () => {
		const state = {
			preferences: {
				pinnedPluginItems: {
					'foo/pinned': true,
					'foo/unpinned': false,
				},
			},
		};

		it( 'should return true if the flag is not set for the plugin item', () => {
			expect( isPluginItemPinned( state, 'foo/unknown' ) ).toBe( true );
		} );

		it( 'should return true if plugin item is not pinned', () => {
			expect( isPluginItemPinned( state, 'foo/pinned' ) ).toBe( true );
		} );

		it( 'should return false if plugin item item is unpinned', () => {
			expect( isPluginItemPinned( state, 'foo/unpinned' ) ).toBe( false );
		} );
	} );

	describe( 'hasMetaBoxes', () => {
		it( 'should return true if there are active meta boxes', () => {
			const state = {
				metaBoxes: {
					normal: {
						isActive: false,
					},
					side: {
						isActive: true,
					},
				},
			};

			expect( hasMetaBoxes( state ) ).toBe( true );
		} );

		it( 'should return false if there are no active meta boxes', () => {
			const state = {
				metaBoxes: {
					normal: {
						isActive: false,
					},
					side: {
						isActive: false,
					},
				},
			};

			expect( hasMetaBoxes( state ) ).toBe( false );
		} );
	} );

	describe( 'isSavingMetaBoxes', () => {
		it( 'should return true if some meta boxes are saving', () => {
			const state = {
				isSavingMetaBoxes: true,
			};

			expect( isSavingMetaBoxes( state ) ).toBe( true );
		} );

		it( 'should return false if no meta boxes are saving', () => {
			const state = {
				isSavingMetaBoxes: false,
			};

			expect( isSavingMetaBoxes( state ) ).toBe( false );
		} );
	} );

	describe( 'getMetaBoxes', () => {
		it( 'should return the state of all meta boxes', () => {
			const state = {
				metaBoxes: {
					normal: {
						isActive: true,
					},
					side: {
						isActive: true,
					},
				},
			};

			expect( getMetaBoxes( state ) ).toEqual( {
				normal: {
					isActive: true,
				},
				side: {
					isActive: true,
				},
			} );
		} );
	} );

	describe( 'getMetaBox', () => {
		it( 'should return the state of selected meta box', () => {
			const state = {
				metaBoxes: {
					normal: {
						isActive: false,
					},
					side: {
						isActive: true,
					},
				},
			};

			expect( getMetaBox( state, 'side' ) ).toEqual( {
				isActive: true,
			} );
		} );
	} );
} );
