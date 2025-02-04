import {
	__experimentalNavigatorScreen as NavigatorScreen,
	__experimentalNavigatorBackButton as NavigatorBackButton,
	__experimentalVStack as VStack,
	Card,
	CardBody,
} from '@wordpress/components';

import './style.scss';

interface Props {
	title?: string;
	description?: string;
	backButtonProps?: {
		icon: JSX.Element;
		label?: string;
		onClick: () => void;
	};
	path: string;
	children: React.ReactNode;
}

export const SidebarNavigatorMenu = ( {
	title,
	description,
	backButtonProps,
	path,
	children,
}: Props ) => {
	return (
		<NavigatorScreen path={ path }>
			<Card>
				<CardBody className="sidebar-v2__navigator-sub-menu">
					<VStack spacing={ 0 } justify="flex-start">
						<ul>
							{ ( backButtonProps || title ) && (
								<li className="sidebar-v2__navigator-sub-menu-header">
									{ backButtonProps && (
										<NavigatorBackButton
											icon={ backButtonProps.icon }
											onClick={ backButtonProps.onClick }
											label={ backButtonProps.label }
											showTooltip
										/>
									) }
									<span>{ title }</span>
								</li>
							) }

							<li>
								{ description && (
									<div className="sidebar-v2__navigator-group-description">{ description }</div>
								) }
							</li>

							{ children }
						</ul>
					</VStack>
				</CardBody>
			</Card>
		</NavigatorScreen>
	);
};
