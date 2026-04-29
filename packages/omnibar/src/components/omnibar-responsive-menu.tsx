import { Button } from '@wordpress/components';
import { Icon, menu } from '@wordpress/icons';

import './omnibar-responsive-menu.scss';

export function OmnibarResponsiveMenu( {
	onClickResponsiveMenu,
}: {
	onClickResponsiveMenu: () => void;
} ) {
	return (
		<Button
			className="omnibar__menu omnibar__responsive-menu"
			label="Menu"
			onClick={ onClickResponsiveMenu }
		>
			<Icon icon={ menu } />
		</Button>
	);
}
