/** @format */
/**
 * Internal dependencies
 */
import * as block from './index';
import registerJetpackBlock from 'gutenberg/extensions/presets/jetpack/utils/register-jetpack-block';

registerJetpackBlock( block.name, block.settings );
