import { useZendeskConversations } from '../../utils/use-zendesk-conversations';

import './get-support.scss';

export const GetSupport = () => {
	const { startNewConversation } = useZendeskConversations();

	const handleOnClick = ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.preventDefault();

		startNewConversation();
	};

	return (
		<div className="odie__transfer-to-human">
			<button onClick={ handleOnClick }>Get support</button>
		</div>
	);
};
