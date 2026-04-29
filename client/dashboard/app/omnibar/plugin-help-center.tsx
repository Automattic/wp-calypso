import { __ } from '@wordpress/i18n';
import { Icon, help } from '@wordpress/icons';
import { useHelpCenter } from '../help-center';
import type { OmnibarNode } from '@automattic/omnibar';

export function useHelpCenterPlugin(): OmnibarNode {
	const { isShown: isHelpCenterShown, setShowHelpCenter } = useHelpCenter();
	return {
		id: 'help-center',
		label: __( 'Help' ),
		icon: <Icon icon={ help } />,
		onClick: () => setShowHelpCenter( ! isHelpCenterShown ),
	};
}
