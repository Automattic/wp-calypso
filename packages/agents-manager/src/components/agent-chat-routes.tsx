import { Navigate, NavigationType, Route, Routes } from 'react-router-dom';
import { isWooAiProvider } from '../utils/is-woo-ai-provider';
import type { ReactNode } from 'react';

export function AgentChatRoutes( {
	chat,
	zendesk,
	history,
	supportGuide,
	isReaderChat,
	navigationType,
}: {
	chat: ReactNode;
	zendesk: ReactNode;
	history: ReactNode;
	supportGuide: ReactNode;
	isReaderChat: boolean;
	navigationType: NavigationType;
} ) {
	return (
		<Routes>
			<Route path="/chat" element={ chat } />
			{ ! isReaderChat && isWooAiProvider() && <Route path="/zendesk" element={ zendesk } /> }
			{ ! isReaderChat && <Route path="/post" element={ supportGuide } /> }
			{ ! isReaderChat && <Route path="/history" element={ history } /> }
			<Route
				path="*"
				element={
					<Navigate
						to="/chat"
						state={ navigationType === NavigationType.Push ? { isNewChat: true } : undefined }
						replace
					/>
				}
			/>
		</Routes>
	);
}
