import { __experimentalVStack as VStack } from '@wordpress/components';
import type { ReactNode } from 'react';
import './style.scss';

interface CalloutOverlayProps {
	showCallout: boolean;
	callout: ReactNode;
	main: ReactNode;
}

export function CalloutOverlay( { showCallout, callout, main }: CalloutOverlayProps ) {
	if ( ! showCallout ) {
		return main;
	}

	return (
		<>
			{ /* The inert attribute is too new for our version of React to understand */ }
			<div ref={ ( el ) => el?.setAttribute( 'inert', '' ) }>{ main }</div>
			<VStack className="dashboard-callout-overlay" alignment="center">
				{ callout }
			</VStack>
		</>
	);
}
