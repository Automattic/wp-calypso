import { Dialog } from '@automattic/components';
import { Nps } from '@automattic/marketing';
import { useState } from 'react';

function NpsSurveyModal() {
	const [ isVisible, setIsVisble ] = useState( true );

	return (
		<Dialog isVisible={ isVisible } onClose={ () => setIsVisble( false ) } showCloseIcon>
			<Nps />
		</Dialog>
	);
}

export default NpsSurveyModal;
