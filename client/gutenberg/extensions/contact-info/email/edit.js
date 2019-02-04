/** @format */

/**
 * Internal dependencies
 */
import save from './save';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import simpleInput from 'gutenberg/extensions/presets/jetpack/utils/simple-input';

const EmailEdit = props => {
	const { setAttributes } = props;
	return simpleInput( 'email', props, __( 'Email' ), save, nextValue =>
		setAttributes( { email: nextValue } )
	);
};

export default EmailEdit;
