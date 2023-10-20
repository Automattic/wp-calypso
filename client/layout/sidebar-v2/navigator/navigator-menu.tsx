import {
	__experimentalNavigatorScreen as NavigatorScreen,
	__experimentalNavigatorToParentButton as NavigatorToParentButton,
	__experimentalVStack as VStack,
	Card,
	CardBody,
} from '@wordpress/components';

import './style.scss';

interface Props {
	description?: string;
	backButtonProps?: {
		icon: JSX.Element;
		label: string;
		onClick: () => void;
	};
	path: string;
	children: React.ReactNode;
}

export const SidebarNavigatorMenu = ( { description, backButtonProps, path, children }: Props ) => {
	return (
		<NavigatorScreen path={ path }>
			<Card>
				<CardBody className="sidebar-v2__navigator-sub-menu">
					<VStack spacing={ 0 } justify="flex-start">
						{ backButtonProps && (
							<NavigatorToParentButton
								icon={ backButtonProps.icon }
								onClick={ backButtonProps.onClick }
								text={ backButtonProps.label }
							/>
						) }
						<div>
							{ description && (
								<div className="sidebar-v2__navigator-group-description">{ description }</div>
							) }
							{ children }
						</div>
					</VStack>
				</CardBody>
			</Card>
		</NavigatorScreen>
	);
};
