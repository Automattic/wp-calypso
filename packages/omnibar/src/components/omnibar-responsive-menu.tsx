import { Icon, menu } from '@wordpress/icons';
import { Button } from '@wordpress/ui';

import './omnibar-responsive-menu.scss';

export function OmnibarResponsiveMenu( {
	onClickResponsiveMenu,
}: {
	onClickResponsiveMenu: () => void;
} ) {
	return (
		<Button
			variant="unstyled"
			className="omnibar__menu omnibar__responsive-menu"
			aria-label="Menu"
			onClick={ onClickResponsiveMenu }
		>
			<Icon icon={ menu } />
		</Button>
	);
}
