#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { Plop, run } from 'plop';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

Plop.prepare(
	{
		configPath: path.join( __dirname, 'plopfile.js' ),
	},
	( env ) => Plop.execute( env, run )
);
