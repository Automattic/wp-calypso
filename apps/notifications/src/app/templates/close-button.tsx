import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import { useDispatch } from 'react-redux';
import actions from '../../panel/state/actions';

const CloseButton = () => {
	const dispatch = useDispatch();
	const handleClose = () => {
		dispatch( actions.ui.closePanel() );
	};

	return <Button size="small" icon={ close } label={ __( 'Close' ) } onClick={ handleClose } />;
};

export default CloseButton;
