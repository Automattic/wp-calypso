/*
 * @format
 */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import deleteBlock from './delete';
import newBlock from './new';

// Used newBlock and deleteBlock because 'new' and 'delete' are reserved words
export default mergeHandlers( deleteBlock, newBlock );
