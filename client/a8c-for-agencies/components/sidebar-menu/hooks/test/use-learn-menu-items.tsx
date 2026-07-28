/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { A4A_AMPLIFY_LINK } from '../../lib/constants';
import useLearnMenuItems from '../use-learn-menu-items';

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: () => 'a8c-for-agencies-development',
	isEnabled: () => false,
} ) );

const mockUseSelector = useSelector as jest.MockedFunction< typeof useSelector >;

const agencyWith = ( {
	amplifyAllowed,
	capabilities,
}: {
	amplifyAllowed: boolean;
	capabilities: string[];
} ) => ( { amplify: { allowed: amplifyAllowed }, user: { capabilities } } );

const amplifyItem = ( path = '/resources-and-tools/learn' ) =>
	renderHook( () => useLearnMenuItems( path ) ).result.current.find(
		( item ) => item.link === A4A_AMPLIFY_LINK
	);

describe( 'useLearnMenuItems', () => {
	it( 'includes Amplify when the agency is allowed and has the capability', () => {
		mockUseSelector.mockReturnValue(
			agencyWith( { amplifyAllowed: true, capabilities: [ 'a4a_read_amplify' ] } )
		);

		expect( amplifyItem() ).toMatchObject( { title: 'Amplify', badge: 'Beta', withChevron: true } );
	} );

	it( 'omits Amplify when the agency is not allowed', () => {
		mockUseSelector.mockReturnValue(
			agencyWith( { amplifyAllowed: false, capabilities: [ 'a4a_read_amplify' ] } )
		);

		expect( amplifyItem() ).toBeUndefined();
	} );

	it( 'omits Amplify when the user lacks the Amplify capability', () => {
		mockUseSelector.mockReturnValue(
			agencyWith( { amplifyAllowed: true, capabilities: [ 'a4a_read_learn' ] } )
		);

		expect( amplifyItem() ).toBeUndefined();
	} );

	it( 'selects Amplify only on the Amplify path', () => {
		mockUseSelector.mockReturnValue(
			agencyWith( { amplifyAllowed: true, capabilities: [ 'a4a_read_amplify' ] } )
		);

		expect( amplifyItem( A4A_AMPLIFY_LINK )?.isSelected ).toBe( true );
		expect( amplifyItem( '/resources-and-tools/learn' )?.isSelected ).toBe( false );
	} );
} );
