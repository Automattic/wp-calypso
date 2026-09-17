const mockBatch = jest.fn();
const mockLiveBlocks = [
	{ clientId: 'a', name: 'core/paragraph', attributes: {}, innerBlocks: [] },
];

jest.mock( '@wordpress/data', () => ( { useRegistry: () => ( { batch: mockBatch } ) } ) );
jest.mock( '../../../utils/canvas-binding', () => ( {
	blockCurrentRequest: jest.fn(),
	getBlockingMove: jest.fn( () => null ),
} ) );
jest.mock( '../../../utils/checkpoints', () => ( {
	checkpointKeys: { BLOCKS: 'blocks' },
	clearCheckpoint: jest.fn(),
	hasCheckpoint: jest.fn( () => false ),
	setCheckpoint: jest.fn(),
} ) );
jest.mock( '../../../utils/editor-blocks', () => ( {
	clearBlockSelection: jest.fn(),
	getRootBlocks: jest.fn( () => mockLiveBlocks ),
	replaceRootBlocks: jest.fn(),
	resolveBlocksRoot: jest.fn( () => ( { clientId: 'root' } ) ),
	stageRootBlocks: jest.fn(),
} ) );
jest.mock( '../commit', () => ( { commitStreamedPageDesign: jest.fn( () => true ) } ) );

import { renderHook } from '@testing-library/react';
import { blockCurrentRequest, getBlockingMove } from '../../../utils/canvas-binding';
import { clearCheckpoint, hasCheckpoint, setCheckpoint } from '../../../utils/checkpoints';
import {
	clearBlockSelection,
	getRootBlocks,
	replaceRootBlocks,
	resolveBlocksRoot,
	stageRootBlocks,
} from '../../../utils/editor-blocks';
import { commitStreamedPageDesign } from '../commit';
import { useEditorHost } from '../use-editor-host';

const blocks = [ { clientId: 'b', name: 'core/heading', attributes: {}, innerBlocks: [] } ];

const host = () => renderHook( () => useEditorHost() ).result.current;

beforeEach( () => jest.clearAllMocks() );

it( 'resolves the root the stream writes into', () => {
	expect( host().resolveRoot() ).toBe( 'root' );

	( resolveBlocksRoot as jest.Mock ).mockReturnValueOnce( null );

	expect( host().resolveRoot() ).toBeNull();
} );

// The callback's canvas guard runs after the frames; the host refuses first.
it( 'refuses a root once the canvas moved, and latches the block', () => {
	( getBlockingMove as jest.Mock ).mockReturnValueOnce( { from: 'About', to: 'Contact' } );

	expect( host().resolveRoot() ).toBeNull();
	expect( blockCurrentRequest ).toHaveBeenCalled();
	expect( resolveBlocksRoot ).not.toHaveBeenCalled();
} );

it( 'stages frames untracked, batched with the registry', () => {
	host().stageBlocks( 'root', blocks );

	expect( stageRootBlocks ).toHaveBeenCalledWith( 'root', blocks, mockBatch );
} );

it( 'checkpoints the page once per tool call', () => {
	const editorHost = host();

	editorHost.captureCheckpoint( 'call-1', 'root' );
	( hasCheckpoint as jest.Mock ).mockReturnValueOnce( true );
	editorHost.captureCheckpoint( 'call-1', 'root' );

	expect( setCheckpoint ).toHaveBeenCalledTimes( 1 );
	expect( setCheckpoint ).toHaveBeenCalledWith( 'call-1', [ 'blocks' ], {
		toolId: 'big_sky__stream_page_design',
		summary: 'Page design',
	} );
	expect( getRootBlocks ).toHaveBeenCalledTimes( 1 );
	expect( getRootBlocks ).toHaveBeenCalledWith( 'root' );
} );

it( 'commits once against a copy of the page as it was, through adapters bound to the root', () => {
	const editorHost = host();

	editorHost.captureCheckpoint( 'call-1', 'root' );
	editorHost.commitFinalDesign( 'call-1', 'root' );
	// The snapshot is spent: a repeated final flush commits nothing.
	editorHost.commitFinalDesign( 'call-1', 'root' );

	expect( commitStreamedPageDesign ).toHaveBeenCalledTimes( 1 );
	expect( clearCheckpoint ).not.toHaveBeenCalled();

	const [ adapters, before ] = ( commitStreamedPageDesign as jest.Mock ).mock.calls[ 0 ];

	expect( before ).toEqual( mockLiveBlocks );
	expect( before ).not.toBe( mockLiveBlocks );

	expect( adapters.getLiveBlocks() ).toBe( mockLiveBlocks );
	adapters.stageBlocks( blocks );
	adapters.replaceBlocks( blocks );
	adapters.clearSelection();

	expect( getRootBlocks ).toHaveBeenNthCalledWith( 2, 'root' );
	expect( stageRootBlocks ).toHaveBeenCalledWith( 'root', blocks, mockBatch );
	expect( replaceRootBlocks ).toHaveBeenCalledWith( 'root', blocks );
	expect( clearBlockSelection ).toHaveBeenCalled();
} );

// An undo that does nothing is never offered.
it( 'drops the checkpoint of a stream that left the page as it was', () => {
	( commitStreamedPageDesign as jest.Mock ).mockReturnValueOnce( false );
	const editorHost = host();

	editorHost.captureCheckpoint( 'call-1', 'root' );
	editorHost.commitFinalDesign( 'call-1', 'root' );

	expect( clearCheckpoint ).toHaveBeenCalledWith( 'call-1' );
} );

it( 'commits nothing for a stream it was told to forget', () => {
	const editorHost = host();

	editorHost.captureCheckpoint( 'call-1', 'root' );
	editorHost.forgetToolCall( 'call-1' );
	editorHost.commitFinalDesign( 'call-1', 'root' );

	expect( commitStreamedPageDesign ).not.toHaveBeenCalled();
	expect( clearCheckpoint ).not.toHaveBeenCalled();
} );

it( 'commits nothing for a stream it never snapshotted', () => {
	host().commitFinalDesign( 'call-9', 'root' );

	expect( commitStreamedPageDesign ).not.toHaveBeenCalled();
} );
