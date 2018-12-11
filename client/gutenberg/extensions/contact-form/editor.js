/** @format */

/**
 * Internal dependencies
 */
import registerJetpackBlock from 'gutenberg/extensions/presets/jetpack/utils/register-jetpack-block';
import { fields, name, settings } from '.';

registerJetpackBlock( name, settings );
fields.forEach( field => registerJetpackBlock( field.name, field.settings ) );
