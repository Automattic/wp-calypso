import { A2uiSurface } from '@a2ui/react/v0_9';
import { InteractiveUiDisabledContext } from './context';
import type { ComponentProps } from 'react';

export function InteractiveUiSurface( {
	surface,
	disabled = false,
}: ComponentProps< typeof A2uiSurface > & { disabled?: boolean } ) {
	return (
		<InteractiveUiDisabledContext.Provider value={ disabled }>
			<fieldset className="ai-ui-renderer" disabled={ disabled }>
				<A2uiSurface surface={ surface } />
			</fieldset>
		</InteractiveUiDisabledContext.Provider>
	);
}
