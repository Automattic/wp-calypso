import { parseActivityContent } from 'calypso/dashboard/components/logs-activity/formatted-block-parser';

/**
 * @deprecated Use parseActivityContent from 'calypso/dashboard/components/logs-activity/formatted-block-parser' instead.
 * We're keeping this in place temporarily to confirm old tests are working
 * TODO: Remove the function
 * Parses a formatted text block into typed nodes
 *
 * Uses the recursive helper after doing some
 * prep work on the list of block ranges.
 * @see parse
 * @param {Object} block the block to parse
 * @returns {Array} list of text and node segments with children
 */
export const parseBlock = parseActivityContent;
