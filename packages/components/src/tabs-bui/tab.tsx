import { Tabs as BaseUITabs } from '@base-ui-components/react/tabs';
import { chevronRight } from '@wordpress/icons';
// import warning from '@wordpress/warning';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { Icon } from '../icon';
// import { useTabsContext } from './context';
import styles from './style.module.scss';
import type { TabProps } from './types';

export const Tab = forwardRef<
	HTMLButtonElement,
	React.ComponentPropsWithoutRef< 'button' > & TabProps
>( function Tab( { className, children, ...otherProps }, ref ) {
	return (
		<BaseUITabs.Tab ref={ ref } { ...otherProps } className={ clsx( styles.tab, className ) }>
			<span className={ styles.tab__children }>{ children }</span>
			<Icon className={ styles.tab__chevron } icon={ chevronRight } />
		</BaseUITabs.Tab>
	);
} );
