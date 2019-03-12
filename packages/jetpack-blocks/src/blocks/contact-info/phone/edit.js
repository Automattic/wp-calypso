/**
 * Internal dependencies
 */
import save from './save';
import { __ } from '../../../utils/i18n';
import simpleInput from '../../../utils/simple-input';

const PhoneEdit = props => {
	const { setAttributes } = props;
	return simpleInput( 'phone', props, __( 'Phone number' ), save, nextValue =>
		setAttributes( { phone: nextValue } )
	);
};

export default PhoneEdit;
