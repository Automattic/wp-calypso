import { ClipboardButton } from '@wordpress/components';
import { useState } from 'react';

const ClipboardButtonExample = () => {
	const [ isCopied, setCopied ] = useState( false );

	const text = 'Code is Poetry';
	return (
		<ClipboardButton
			text={ text }
			onCopy={ () => setCopied( true ) }
			onFinishCopy={ () => setCopied( false ) }
		>
			{ isCopied ? 'Copied!' : `Copy "${ text }"` }
		</ClipboardButton>
	);
};

export default ClipboardButtonExample;
