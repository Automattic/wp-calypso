import { Tabs as BaseUITabs } from '@base-ui-components/react/tabs';
import clsx from 'clsx';
import { forwardRef } from 'react';
import styles from './style.module.scss';
import type { TabPanelProps } from './types';

export const TabPanel = forwardRef<
	HTMLDivElement,
	React.ComponentPropsWithoutRef< 'div' > & TabPanelProps
>( function TabPanel( { className, ...otherProps }, ref ) {
	return (
		<BaseUITabs.Panel
			ref={ ref }
			// focusable={ focusable }
			{ ...otherProps }
			className={ clsx( styles.tabpanel, className ) }
		/>
	);
} );
