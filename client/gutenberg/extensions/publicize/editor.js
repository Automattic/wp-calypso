/** @format */

/**
 * Internal dependencies
 */
import registerJetpackPlugin from 'gutenberg/extensions/presets/jetpack/utils/register-jetpack-plugin';
import * as plugin from './index';

registerJetpackPlugin( plugin.name, plugin.settings );
