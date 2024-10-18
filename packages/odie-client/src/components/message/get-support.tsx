import { useGetOdieStorage } from '../../data';
import { useCreateZendeskConversation } from '../../query/use-create-zendesk-conversation';

import './get-support.scss';

export const GetSupport = () => {
	const chatId = useGetOdieStorage( 'chat_id' );
	const newConversation = useCreateZendeskConversation( chatId );

	const handleOnClick = async ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.preventDefault();

		await newConversation();
	};

	return (
		<div className="odie__transfer-to-human">
			<button onClick={ handleOnClick }>Get support</button>
		</div>
	);
};
