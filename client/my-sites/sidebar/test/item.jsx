import { canCustomizeSidebarItem } from '../item';

describe( 'canCustomizeSidebarItem', () => {
	test( 'requires customize mode, an itemId, and an explicit reassignable flag', () => {
		expect( canCustomizeSidebarItem( true, 'plugin:jetpack/jetpack.php:-:jetpack', true ) ).toBe(
			true
		);
		expect( canCustomizeSidebarItem( false, 'plugin:jetpack/jetpack.php:-:jetpack', true ) ).toBe(
			false
		);
		expect( canCustomizeSidebarItem( true, undefined, true ) ).toBe( false );
		expect( canCustomizeSidebarItem( true, 'core:core:-:index.php', false ) ).toBe( false );
		expect( canCustomizeSidebarItem( true, 'core:core:-:index.php', undefined ) ).toBe( false );
	} );
} );
