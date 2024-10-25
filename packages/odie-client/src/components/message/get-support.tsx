import { useOdieAssistantContext } from '../../context';
import { useCreateZendeskConversation } from '../../query/use-create-zendesk-conversation';

import './get-support.scss';

export const GetSupport = () => {
	const newConversation = useCreateZendeskConversation();
	const { shouldUseHelpCenterExperience } = useOdieAssistantContext();
	const handleOnClick = async ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.preventDefault();

		await newConversation();
	};

	const getButtonText = () => {
		return shouldUseHelpCenterExperience ? 'Get instant support' : 'Get support';
	};
	return (
		<div className="odie__transfer-to-human">
			<button onClick={ handleOnClick }>{ getButtonText() }</button>
		</div>
	);
};
