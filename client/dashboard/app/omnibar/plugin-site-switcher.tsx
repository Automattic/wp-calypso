import { __ } from '@wordpress/i18n';
import { Icon, chevronUpDown } from '@wordpress/icons';
import { useEffect, useRef } from 'react';
import { omnibarEvents } from './events';
import type { OmnibarNode } from '@automattic/omnibar';

export function useSiteSwitcherPlugin(): OmnibarNode {
	const iconRef = useRef< HTMLSpanElement >( null );

	useEffect( () => {
		omnibarEvents.siteSwitcherAnchor.emit( iconRef.current?.closest( 'button' ) ?? null );
	} );

	return {
		id: 'site-switcher',
		label: __( 'Switch site' ),
		icon: <Icon ref={ iconRef } icon={ chevronUpDown } size={ 16 } />,
		onClick: () => omnibarEvents.siteSwitcher.emit(),
	};
}
