import { __experimentalVStack as VStack } from '@wordpress/components';
import type { ReactNode } from 'react';
import './style.scss';

interface CalloutOverlayProps {
	callout: ReactNode;
	main?: ReactNode;
}

export function CalloutOverlay( { callout, main }: CalloutOverlayProps ) {
	return (
		<div style={ { position: 'relative' } }>
			{ /* The inert attribute is too new for our version of React to understand */ }
			<div ref={ ( el ) => el?.setAttribute( 'inert', '' ) }>{ main }</div>
			<VStack className="dashboard-callout-overlay" alignment="center">
				{ callout }
			</VStack>
		</div>
	);
}
