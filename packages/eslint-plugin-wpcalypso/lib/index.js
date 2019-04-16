/**
 * @fileoverview ESLint rules for the WordPress.com Calypso project
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

const rules = require( './rules' );
const configs = require( './configs' );

module.exports = {
	rules,
	configs,
};
