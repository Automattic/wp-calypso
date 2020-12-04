/**
 * External dependencies
 */
import React, { useState } from 'react';

import Dialog from '.';

export default { title: 'Dialog' };

export const Default = () => {
	const [ isVisible, setVisible ] = useState( false );
	const handleShowDialog = () => setVisible( true );
	const handleHideDialog = () => setVisible( false );
	return (
		<>
			<button onClick={ handleShowDialog }>Open Dialog</button>
			<Dialog isVisible={ isVisible } onClose={ handleHideDialog } shouldCloseOnEsc>
				Hello World!
			</Dialog>
		</>
	);
};
