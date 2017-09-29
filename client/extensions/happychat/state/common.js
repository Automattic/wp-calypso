/**
 * This is a temporary file to hold common functions while they're being used
 * in both actions.js and middleware.js. Once we've finished refactoring
 * all side effecting actions into middleware.js, these can be moved there.
 */

/**
 * Internal dependencies
 */
import buildConnection from 'extensions/happychat/lib/connection';

export const connection = buildConnection();
