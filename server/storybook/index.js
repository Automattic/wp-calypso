/**
 * External dependencies
 */

import * as path from 'path';
import express from 'express';

module.exports = express
	.Router()
	.use(
		'/storybook',
		express.static( path.join( __dirname, '../../packages/components/storybook-static' ) )
	);
