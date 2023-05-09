import PluginCommonTable from '../plugin-common/plugin-common-table';
import type { Columns, PluginRowFormatterArgs, PluginComponentProps } from '../types';
import type { ReactNode } from 'react';

interface Props {
	isLoading: boolean;
	columns: Columns;
	items: Array< PluginComponentProps >;
	rowFormatter: ( args: PluginRowFormatterArgs ) => ReactNode;
	hasMoreActions: boolean;
	primaryKey: string;
}

export default function PluginsTable( props: Props ) {
	return <PluginCommonTable { ...props } />;
}
