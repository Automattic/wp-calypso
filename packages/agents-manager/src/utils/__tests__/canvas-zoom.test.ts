/**
 * @jest-environment jsdom
 */

const mockSetZoomLevel = jest.fn();
const mockResetZoomLevel = jest.fn();
const mockSetEditorMode = jest.fn();
const mockIsZoomOut = jest.fn();

jest.mock( '@wordpress/block-editor', () => ( { store: 'core/block-editor' } ) );
jest.mock( '@wordpress/data', () => ( {
	dispatch: () => ( {
		__unstableSetEditorMode: mockSetEditorMode,
	} ),
	select: () => ( {} ),
} ) );

jest.mock( '../unlock-private-apis', () => ( {
	unlock: ( obj: unknown ) => ( {
		...( obj as object ),
		setZoomLevel: mockSetZoomLevel,
		resetZoomLevel: mockResetZoomLevel,
		isZoomOut: mockIsZoomOut,
	} ),
} ) );

const mockCanvasIframeBody = {
	addEventListener: jest.fn(),
	removeEventListener: jest.fn(),
};

jest.mock( '../canvas-iframe-elements', () => ( {
	getCanvasIframeElements: () => ( {
		canvasIframeBody: mockCanvasIframeBody,
	} ),
} ) );

import { zoomIn, zoomOut, toggleZoom } from '../canvas-zoom';

beforeEach( () => jest.clearAllMocks() );

describe( 'zoomOut', () => {
	it( 'sets zoom level and editor mode', () => {
		zoomOut();

		expect( mockSetZoomLevel ).toHaveBeenCalledWith( 0.5 );
		expect( mockSetEditorMode ).toHaveBeenCalledWith( 'zoom-out' );
	} );

	it( 'adds double-click blocker when `blockDoubleClick` is true', () => {
		zoomOut( { blockDoubleClick: true } );

		expect( mockCanvasIframeBody.addEventListener ).toHaveBeenCalledWith(
			'dblclick',
			expect.any( Function ),
			true
		);
	} );

	it( 'does not add double-click blocker by default', () => {
		zoomOut();

		expect( mockCanvasIframeBody.addEventListener ).not.toHaveBeenCalled();
	} );
} );

describe( 'zoomIn', () => {
	it( 'resets zoom level and editor mode', () => {
		zoomIn();

		expect( mockResetZoomLevel ).toHaveBeenCalled();
		expect( mockSetEditorMode ).toHaveBeenCalledWith( 'edit' );
	} );

	it( 'removes double-click blocker', () => {
		zoomIn();

		expect( mockCanvasIframeBody.removeEventListener ).toHaveBeenCalledWith(
			'dblclick',
			expect.any( Function ),
			true
		);
	} );
} );

describe( 'toggleZoom', () => {
	it( 'calls zoomIn when currently zoomed out', () => {
		mockIsZoomOut.mockReturnValue( true );
		toggleZoom();

		expect( mockResetZoomLevel ).toHaveBeenCalled();
		expect( mockSetEditorMode ).toHaveBeenCalledWith( 'edit' );
	} );

	it( 'calls zoomOut when not zoomed out', () => {
		mockIsZoomOut.mockReturnValue( false );
		toggleZoom();

		expect( mockSetZoomLevel ).toHaveBeenCalledWith( 0.5 );
		expect( mockSetEditorMode ).toHaveBeenCalledWith( 'zoom-out' );
	} );
} );
