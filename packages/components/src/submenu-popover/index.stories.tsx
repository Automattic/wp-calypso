import '@wordpress/components/build-style/style.css';
import { DropdownMenu, Icon, MenuGroup, MenuItem } from '@wordpress/components';
import { chevronRight } from '@wordpress/icons';
import SubmenuPopover, { useSubmenuPopoverProps } from '.';

export default { title: 'Unaudited/SubmenuPopover' };

export const Default = () => {
	const submenu = useSubmenuPopoverProps< HTMLDivElement >();
	const secondSubmenu = useSubmenuPopoverProps< HTMLDivElement >();
	return (
		<DropdownMenu label="Menu">
			{ () => (
				<MenuGroup>
					<MenuItem>Item 1</MenuItem>
					<div { ...submenu.parent }>
						<MenuItem>
							Item 2 <Icon icon={ chevronRight } />
						</MenuItem>
						<SubmenuPopover { ...submenu.submenu }>
							<MenuGroup>
								<MenuItem>Item 2.1</MenuItem>
								<MenuItem>Item 2.2</MenuItem>
								<div { ...secondSubmenu.parent }>
									<MenuItem>
										Item 2.3 <Icon icon={ chevronRight } />
									</MenuItem>
									<SubmenuPopover { ...secondSubmenu.submenu }>
										<MenuGroup>
											<MenuItem>Item 2.3.1</MenuItem>
											<MenuItem>Item 2.3.2</MenuItem>
											<MenuItem>Item 2.3.3</MenuItem>
											<MenuItem>Item 2.3.4</MenuItem>
											<MenuItem>Item 2.3.5</MenuItem>
											<MenuItem>Item 2.3.6</MenuItem>
										</MenuGroup>
									</SubmenuPopover>
								</div>
								<MenuItem>Item 2.4</MenuItem>
							</MenuGroup>
						</SubmenuPopover>
					</div>
					<MenuItem>Item 3</MenuItem>
					<MenuItem>Item 4</MenuItem>
				</MenuGroup>
			) }
		</DropdownMenu>
	);
};
