import OdieAssistantProvider, {
	OdieAssistant,
	EllipsisMenu,
	useOdieAssistantContext,
} from '@automattic/odie-client';

const OdieBot = () => {
	const { clearChat } = useOdieAssistantContext();
	return (
		<OdieAssistantProvider botNameSlug="jetpack-support-chat">
			<div className="custom-class">
				<EllipsisMenu popoverClassName="menu-class" position="bottom">
					<span
						role="button"
						tabIndex={ 0 }
						onClick={ () => clearChat() }
						onKeyPress={ () => clearChat() }
						className="menu-item-class"
					>
						Start a New Chat
					</span>
				</EllipsisMenu>
			</div>
			<OdieAssistant />
		</OdieAssistantProvider>
	);
};

window.JetpackSupportBot = OdieBot();
