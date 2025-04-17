import * as Ariakit from '@ariakit/react';
import { useStoreState } from '@ariakit/react';
import clsx from 'clsx';
import debugFactory from 'debug';
import { forwardRef } from 'react';
import { useTabsContext } from './context';
import styles from './styles.module.css';
import type { TabPanelProps } from './types';
const debug = debugFactory( 'a8c-ds:tabs' );

export const TabPanel = forwardRef<
	HTMLDivElement,
	Omit< React.ComponentPropsWithoutRef< 'div' >, 'id' > & TabPanelProps
>( function TabPanel( { children, tabId, focusable = true, ...otherProps }, ref ) {
	const context = useTabsContext();
	const selectedId = useStoreState( context?.store, 'selectedId' );
	if ( ! context ) {
		debug( '`Tabs.TabPanel` must be wrapped in a `Tabs` component.' );
		return null;
	}
	const { store, instanceId } = context;
	const instancedTabId = `${ instanceId }-${ tabId }`;

	return (
		<Ariakit.TabPanel
			ref={ ref }
			store={ store }
			// For TabPanel, the id passed here is the id attribute of the DOM
			// element.
			// `tabId` is the id of the tab that controls this panel.
			id={ `${ instancedTabId }-view` }
			tabId={ instancedTabId }
			focusable={ focusable }
			{ ...otherProps }
			className={ clsx( styles.tabPanel, otherProps.className ) }
		>
			{ selectedId === instancedTabId && children }
		</Ariakit.TabPanel>
	);
} );
