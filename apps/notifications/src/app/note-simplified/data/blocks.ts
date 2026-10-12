import { zipWithSignature } from '../../../panel/templates/functions';
import type { Block, BlockWithSignature, Note } from '../../types';

type BlockType = BlockWithSignature[ 'signature' ][ 'type' ];

const getSignedBlocks = ( note: Note ): BlockWithSignature[] => zipWithSignature( note.body, note );

export const getBlocks = ( note: Note, type: BlockType ): Block[] =>
	getSignedBlocks( note )
		.filter( ( { signature } ) => signature.type === type )
		.map( ( { block } ) => block );

export const getPeople = ( note: Note ) => getBlocks( note, 'user' );

export const hasComment = ( note: Note ) => getBlocks( note, 'comment' ).length > 0;

/** The note's blocks, minus those of the given types. */
export const getBlocksWithout = ( note: Note, types: BlockType[] ): Block[] =>
	getSignedBlocks( note )
		.filter( ( { signature } ) => ! types.includes( signature.type ) )
		.map( ( { block } ) => block );
