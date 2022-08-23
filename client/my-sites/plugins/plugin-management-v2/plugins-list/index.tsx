import PluginCommonList from '../plugin-common/plugin-common-list';
import PluginRowFormatter from '../plugin-row-formatter';
import type { Columns, PluginRowFormatterArgs, Plugin } from '../types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ReactElement, ReactNode } from 'react';

interface Props {
	selectedSite: SiteData;
	items: Array< Plugin >;
	isLoading: boolean;
	columns: Columns;
	title?: ReactNode;
	hasMoreActions?: boolean;
}

export default function PluginsList( {
	hasMoreActions = true,
	selectedSite,
	...rest
}: Props ): ReactElement {
	const rowFormatter = ( props: PluginRowFormatterArgs ) => {
		return <PluginRowFormatter { ...props } selectedSite={ selectedSite } />;
	};

	return (
		<PluginCommonList
			{ ...rest }
			selectedSite={ selectedSite }
			hasMoreActions={ hasMoreActions }
			rowFormatter={ rowFormatter }
			primaryKey="id"
		/>
	);
}
