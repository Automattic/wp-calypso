import { chevronRight } from '@wordpress/icons';
import warning from '@wordpress/warning';
import { forwardRef } from 'react';
import { useTabsContext } from './context';
import {
	Tab as StyledTab,
	TabChildren as StyledTabChildren,
	TabChevron as StyledTabChevron,
} from './styles';
import type { TabProps } from './types';

export const Tab = forwardRef<
	HTMLButtonElement,
	Omit< React.ComponentPropsWithoutRef< 'button' >, 'id' > & TabProps
>( function Tab( { children, tabId, disabled, render, ...otherProps }, ref ) {
	const { store, instanceId } = useTabsContext() ?? {};

	if ( ! store ) {
		warning( '`Tabs.Tab` must be wrapped in a `Tabs` component.' );
		return null;
	}

	const instancedTabId = `${ instanceId }-${ tabId }`;

	return (
		<StyledTab
			ref={ ref }
			store={ store }
			id={ instancedTabId }
			disabled={ disabled }
			render={ render }
			{ ...otherProps }
		>
			<StyledTabChildren>{ children }</StyledTabChildren>
			<StyledTabChevron icon={ chevronRight } />
		</StyledTab>
	);
} );
