import { parseActivityLogEntryContent } from 'calypso/dashboard/components/logs-activity-formatted-block/api-core-parser';

/**
 * @deprecated Use parseActivityLogEntryContent from 'calypso/dashboard/components/logs-activity-formatted-block/api-core-parser' instead.
 * We're keeping this in place temporarily to confirm old tests are working
 * TODO: Remove the function
 * Parses a formatted text block into typed nodes
 *
 * Uses the recursive helper after doing some
 * prep work on the list of block ranges.
 * @see parse
 * @param {Object} segment the block to parse
 * @returns {Array} list of text and node segments with children
 */
const stripTextProp = ( segment ) => {
	if ( 'string' === typeof segment ) {
		return segment;
	}

	if ( ! segment || 'object' !== typeof segment ) {
		return segment;
	}

	const { text, children, ...rest } = segment;
	return Object.assign( {}, rest, children ? { children: children.map( stripTextProp ) } : {} );
};

/**
 * @deprecated Use parseActivityLogEntryContent from 'calypso/dashboard/components/logs-activity-formatted-block/api-core-parser' instead.
 * We're keeping this in place temporarily to confirm old tests are working
 * TODO: Remove the function
 */
export const parseBlock = ( block ) => parseActivityLogEntryContent( block ).map( stripTextProp );
