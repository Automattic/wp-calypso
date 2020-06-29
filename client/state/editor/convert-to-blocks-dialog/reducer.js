/**
 * Internal dependencies
 */
import { CONVERT_TO_BLOCKS_DIALOG_DISMISS } from 'state/action-types';
import { keyedReducer, withSchemaValidation } from 'state/utils';
import { schema } from './schema';

export const convertToBlocksDialog = ( state = [], { type, postId } ) =>
	type === CONVERT_TO_BLOCKS_DIALOG_DISMISS ? { ...state, [ postId ]: 'dismissed' } : state;

export default withSchemaValidation( schema, keyedReducer( 'siteId', convertToBlocksDialog ) );
