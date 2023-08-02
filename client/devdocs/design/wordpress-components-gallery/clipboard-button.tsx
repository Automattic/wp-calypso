import { ClipboardButton } from '@wordpress/components';
import { useState } from 'react';

const ClipboardButtonExample = () => {
	const [ isCopied, setCopied ] = useState( false );

	const text = 'Code is Poetry';
	return (
		<ClipboardButton
			// @ts-expect-error The button props are passed into a Button component internally, but the types don't account that.
			variant="primary"
			text={ text }
			onCopy={ () => setCopied( true ) }
			onFinishCopy={ () => setCopied( false ) }
		>
			{ isCopied ? 'Copied!' : `Copy "${ text }"` }
		</ClipboardButton>
	);
};

export default ClipboardButtonExample;
