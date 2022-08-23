import PluginCommonList from '../plugin-common/plugin-common-list';
import PluginRowFormatter from '../plugin-row-formatter';
import type { Columns, SiteRowFormatterArgs, Plugin } from '../types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ReactElement, ReactNode } from 'react';

interface Props {
	selectedSite: SiteData;
	items: Array< SiteData | null | undefined >;
	isLoading: boolean;
	columns: Columns;
	title?: ReactNode;
	hasMoreActions?: boolean;
	plugin: Plugin;
}

export default function SitesList( {
	hasMoreActions = true,
	selectedSite,
	plugin,
	...rest
}: Props ): ReactElement {
	const rowFormatter = ( { item, ...rest }: SiteRowFormatterArgs ) => {
		return <PluginRowFormatter { ...rest } item={ plugin } selectedSite={ item } />;
	};

	return (
		<PluginCommonList
			{ ...rest }
			selectedSite={ selectedSite }
			hasMoreActions={ hasMoreActions }
			rowFormatter={ rowFormatter }
			primaryKey="ID"
		/>
	);
}
