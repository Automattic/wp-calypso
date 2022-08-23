import PluginCommonTable from '../plugin-common/plugin-common-table';
import type { Columns, PluginRowFormatterArgs, Plugin } from '../types';
import type { ReactElement, ReactNode } from 'react';

interface Props {
	isLoading: boolean;
	columns: Columns;
	items: Array< Plugin >;
	rowFormatter: ( args: PluginRowFormatterArgs ) => ReactNode;
	hasMoreActions: boolean;
	primaryKey: string;
}

export default function PluginsTable( props: Props ): ReactElement {
	return <PluginCommonTable { ...props } />;
}
