/** @format */

/**
 * Internal dependencies
 */
import { name, settings } from './index.js';
import registerJetpackPlugin from 'gutenberg/extensions/presets/jetpack/utils/register-jetpack-plugin';

registerJetpackPlugin( name, settings );
