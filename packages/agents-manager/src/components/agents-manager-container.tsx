import { PersistentRouter } from '@automattic/help-center';
import { AgentsManagerContent } from './agents-manager-content';
import { BackButton } from './back-button';
import type { Location } from 'history';

type AgentsManagerContainerProps = {
	isDocked: boolean;
	onToggleDock: () => void;
	onClose: () => void;
	routerHistory?: { entries: Location[]; index: number } | undefined;
};

const DockIcon = () => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M5 5H15V15H5V5Z"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M5 5L15 15"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export const AgentsManagerContainer = ( {
	isDocked,
	onToggleDock,
	onClose,
	routerHistory,
}: AgentsManagerContainerProps ) => {
	const containerClassName = isDocked ? 'agents-manager__sidebar' : 'agents-manager__modal';
	const headerClassName = isDocked
		? 'agents-manager__sidebar-header'
		: 'agents-manager__modal-header';
	const actionsClassName = isDocked
		? 'agents-manager__sidebar-actions'
		: 'agents-manager__modal-actions';
	const contentClassName = isDocked
		? 'agents-manager__sidebar-content'
		: 'agents-manager__modal-content';

	return (
		<PersistentRouter
			routerHistory={ routerHistory }
			persistenceKey="agents_manager_router_history"
		>
			<div className={ containerClassName }>
				<div className={ headerClassName }>
					<BackButton />
					<h2 id="agents-manager-header-text">Agents Manager</h2>
					<div className={ actionsClassName }>
						<button
							onClick={ onToggleDock }
							aria-label={ isDocked ? 'Undock Agents Manager' : 'Dock Agents Manager' }
							className="agents-manager__icon-button"
						>
							<DockIcon />
						</button>
						<button
							onClick={ onClose }
							aria-label="Close Agents Manager"
							className="agents-manager__icon-button"
						>
							×
						</button>
					</div>
				</div>
				<div className={ contentClassName }>
					<AgentsManagerContent />
				</div>
			</div>
		</PersistentRouter>
	);
};
