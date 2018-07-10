#!/usr/bin/env node

/**
 * Internal dependencies
 */
const { getCliArgs, spawnScript } = require( '../utils' );

const [ scriptName, ...nodesArgs ] = getCliArgs();

spawnScript( scriptName, nodesArgs );
