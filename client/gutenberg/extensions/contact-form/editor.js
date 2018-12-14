/** @format */

/**
 * Internal dependencies
 */
import registerJetpackBlock from 'gutenberg/extensions/presets/jetpack/utils/register-jetpack-block';
import { children, name, settings } from '.';

registerJetpackBlock( name, settings );
children.forEach( child => registerJetpackBlock( child.name, child.settings ) );
