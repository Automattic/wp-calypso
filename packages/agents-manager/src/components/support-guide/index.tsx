import { HelpCenterArticle } from '@automattic/help-center';
import './style.scss';

export default function SupportGuide() {
	return (
		<div className="agenttic agent-manager-support-guide-wrapper">
			<div className="agent-manager-support-guide-header">Header</div>
			<div className="agent-manager-support-guide-content">
				<HelpCenterArticle />
			</div>
			<div className="agent-manager-support-guide-header">Footer</div>
		</div>
	);
}
