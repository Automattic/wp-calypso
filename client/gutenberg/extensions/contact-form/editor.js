/** @format */

/**
 * Internal dependencies
 */
import registerJetpackBlock from 'gutenberg/extensions/presets/jetpack/utils/register-jetpack-block';
import { childBlocks, name, settings } from '.';

registerJetpackBlock( name, settings );
childBlocks.forEach( childBlock => registerJetpackBlock( childBlock.name, childBlock.settings ) );
