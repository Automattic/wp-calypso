import { __ } from '@wordpress/i18n';
import { useHelpCenter } from '../help-center';
import { useElementIsHovered } from './use-element-is-hovered';
import type { OmnibarNode } from '@automattic/omnibar';

import './plugin-help-center.scss';

function HelpIcon() {
	return (
		<svg
			className="omnibar__help-icon"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 16v-2h2v2h-2zm2-3v-1.141A3.991 3.991 0 0016 10a4 4 0 00-8 0h2c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2a1 1 0 00-1 1v2h2z"
			/>
		</svg>
	);
}

export function useHelpCenterPlugin(): OmnibarNode {
	const { isShown: isHelpCenterShown, setShowHelpCenter } = useHelpCenter();
	const isHovered = useElementIsHovered( '.help-center__container' );
	const isActive = isHelpCenterShown && isHovered;

	return {
		id: 'help-center',
		label: __( 'Help' ),
		icon: <HelpIcon />,
		isActive,
		onClick: () => setShowHelpCenter( ! isHelpCenterShown ),
	};
}
