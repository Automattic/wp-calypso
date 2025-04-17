import * as Ariakit from '@ariakit/react';
import { chevronRight } from '@wordpress/icons';
import warning from '@wordpress/warning';
import clsx from 'clsx';
import { forwardRef } from 'react';
import Icon from '../icon';
import { useTabsContext } from './context';
import styles from './styles.module.css';
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
		<Ariakit.Tab
			ref={ ref }
			store={ store }
			id={ instancedTabId }
			disabled={ disabled }
			render={ render }
			{ ...otherProps }
			className={ clsx( styles.tab, otherProps.className ) }
		>
			<span className={ styles.tabChildren }>{ children }</span>
			<Icon icon={ chevronRight } className={ styles.tabChevron } />
		</Ariakit.Tab>
	);
} );
