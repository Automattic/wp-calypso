import PluginCommonTable from '../plugin-common/plugin-common-table';
import type { Columns, PluginRowFormatterArgs } from '../types';
import type { Plugin } from 'calypso/state/plugins/installed/types';
import type { ReactNode } from 'react';

interface Props {
	isLoading: boolean;
	columns: Columns;
	items: Array< Plugin >;
	rowFormatter: ( args: PluginRowFormatterArgs ) => ReactNode;
	hasMoreActions: boolean;
	primaryKey: string;
}

export default function PluginsTable( props: Props ) {
	return <PluginCommonTable { ...props } />;
}
