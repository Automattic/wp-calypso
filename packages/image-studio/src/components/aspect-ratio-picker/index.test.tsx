/* eslint-disable import/order */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

jest.mock( '@automattic/agenttic-ui', () => ( {
	AgentUI: {
		InputToolbar: ( { label }: { label: string } ) => <button type="button">{ label }</button>,
	},
	cn: () => '',
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn( () => ( {} ) ),
	useSelect: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

jest.mock( '../../store', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: {
		JetpackAIFeaturedImage: 'jetpack_ai_featured_image',
		JetpackExternalMediaFeaturedImage: 'jetpack_external_media_featured_image',
	},
} ) );

jest.mock( '../icons/AspectRatioIcon', () => ( {
	AspectRatioIcon: () => null,
} ) );

// Import after mocks
import { useSelect } from '@wordpress/data';
import { AspectRatioPicker } from './index';

function mockStore( selectedAspectRatio: string | null, entryPoint: string | null ) {
	( useSelect as jest.Mock ).mockImplementation( ( selector ) =>
		selector( () => ( {
			getSelectedAspectRatio: () => selectedAspectRatio,
			getEntryPoint: () => entryPoint,
		} ) )
	);
}

describe( 'AspectRatioPicker', () => {
	it( 'shows 16:9 for a featured image session with no ratio picked', () => {
		mockStore( null, 'jetpack_ai_featured_image' );

		render( <AspectRatioPicker /> );

		expect( screen.getByRole( 'button', { name: '16:9' } ) ).toBeInTheDocument();
	} );

	it( 'shows the picked ratio over the featured image default', () => {
		mockStore( '1:1', 'jetpack_ai_featured_image' );

		render( <AspectRatioPicker /> );

		expect( screen.getByRole( 'button', { name: '1:1' } ) ).toBeInTheDocument();
	} );

	it( 'shows no ratio for other sessions with no ratio picked', () => {
		mockStore( null, 'media_library' );

		render( <AspectRatioPicker /> );

		expect( screen.getByRole( 'button', { name: 'Aspect Ratio' } ) ).toBeInTheDocument();
	} );
} );
