import { useStoreState } from '@ariakit/react';
import warning from '@wordpress/warning';
import { forwardRef } from 'react';
import { useTabsContext } from './context';
import { TabPanel as StyledTabPanel } from './styles';
import type { TabPanelProps } from './types';

export const TabPanel = forwardRef<
	HTMLDivElement,
	Omit< React.ComponentPropsWithoutRef< 'div' >, 'id' > & TabPanelProps
>( function TabPanel( { children, tabId, focusable = true, ...otherProps }, ref ) {
	const context = useTabsContext();
	const selectedId = useStoreState( context?.store, 'selectedId' );
	if ( ! context ) {
		warning( '`Tabs.TabPanel` must be wrapped in a `Tabs` component.' );
		return null;
	}
	const { store, instanceId } = context;
	const instancedTabId = `${ instanceId }-${ tabId }`;

	return (
		<StyledTabPanel
			ref={ ref }
			store={ store }
			// For TabPanel, the id passed here is the id attribute of the DOM
			// element.
			// `tabId` is the id of the tab that controls this panel.
			id={ `${ instancedTabId }-view` }
			tabId={ instancedTabId }
			focusable={ focusable }
			{ ...otherProps }
		>
			{ selectedId === instancedTabId && children }
		</StyledTabPanel>
	);
} );
