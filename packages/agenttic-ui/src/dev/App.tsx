import React, { useMemo, useState } from 'react';
import { AgentChat } from '../components/AgentChat';
import type { ContextProvider, ToolProvider } from '../types';
import { getClientContext } from './mockContext';
import { getClientTools } from './mockTools';
import { useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
//import { XIcon } from '../components/icons/XIcon';

const App: React.FC = () => {
	const dispatch = useDispatch( STORE_NAME );

	const [ contextProvider ] = useState< ContextProvider >( () => {
		return {
			getClientContext,
		};
	} );

	const toolProvider = useMemo< ToolProvider >( () => {
		const tools = getClientTools( dispatch.addMessage );
		return {
			getAvailableTools: tools.getAvailableTools,
			executeTool: tools.executeTool,
		};
	}, [ dispatch.addMessage ] );

	// const notice = {
	// 	message: 'This is a test notice.',
	// 	icon: <XIcon />,
	// 	action: {
	// 		label: 'Upgrade',
	// 		onClick: () => console.log( 'Notice clicked' ),
	// 	},
	// 	dismissible: true,
	// 	onDismiss: () => console.log( 'Notice dismissed' ),
	// };

	// const emptyViewExample = (
	// 	<h2>How can I help you today?</h2>
	// );

	return (
		<AgentChat
			agentId="big-sky"
			agentUrl="https://public-api.wordpress.com/wpcom/v2/ai/agent"
			sessionId={ `dev-session` }
			contextProvider={ contextProvider }
			toolProvider={ toolProvider }
			variant="floating"
			// notice={ notice }
			// placeholder="Ask me anything"
			// emptyView={ emptyViewExample }
		/>
	);
};

export default App;
