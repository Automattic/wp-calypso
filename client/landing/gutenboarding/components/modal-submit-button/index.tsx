import { Button } from '@wordpress/components';
import React from 'react';

import './style.scss';

const ModalSubmitButton = ( props: Button.Props ) => {
	return (
		<Button type="submit" className="modal-submit-button" isPrimary { ...props }>
			{ props.children }
		</Button>
	);
};

export default ModalSubmitButton;
