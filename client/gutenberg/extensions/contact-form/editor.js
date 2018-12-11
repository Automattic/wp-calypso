/** @format */

/**
 * Internal dependencies
 */
import * as form from './index';
import registerJetpackBlock from 'gutenberg/extensions/presets/jetpack/utils/register-jetpack-block';

registerJetpackBlock( form.name, form.settings );
form.fields.forEach( field => registerJetpackBlock( field.name, field.settings ) );
