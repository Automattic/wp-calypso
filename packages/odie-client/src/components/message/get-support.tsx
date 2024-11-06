import { __ } from '@wordpress/i18n';
import { useOdieAssistantContext } from '../../context';
import { useCreateZendeskConversation } from '../../hooks';

import './get-support.scss';

export const GetSupport = ( {
	onClickAdditionalEvent,
}: {
	onClickAdditionalEvent?: () => void;
} ) => {
	const newConversation = useCreateZendeskConversation();
	const { shouldUseHelpCenterExperience, chat } = useOdieAssistantContext();

	const handleOnClick = async ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.preventDefault();

		onClickAdditionalEvent?.();

		await newConversation();
	};

	const getButtonText = () => {
		return shouldUseHelpCenterExperience
			? __( 'Get instant support', __i18n_text_domain__ )
			: __( 'Get support', __i18n_text_domain__ );
	};

	// We don't want the user to see this button if they are already talking to a human.
	if ( chat.provider !== 'odie' ) {
		return null;
	}

	return (
		<div className="odie__transfer-to-human">
			<button onClick={ handleOnClick }>{ getButtonText() }</button>
		</div>
	);
};
