/**
 * Internal dependencies
 */
import save from './save';
import { __ } from '../../../utils/i18n';
import simpleInput from '../../../utils/simple-input';

const EmailEdit = props => {
	const { setAttributes } = props;
	return simpleInput( 'email', props, __( 'Email' ), save, nextValue =>
		setAttributes( { email: nextValue } )
	);
};

export default EmailEdit;
