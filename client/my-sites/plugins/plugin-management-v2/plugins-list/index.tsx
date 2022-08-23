import List from '../common/list';
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
	primaryKey: string;
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
		<List
			{ ...rest }
			selectedSite={ selectedSite }
			hasMoreActions={ hasMoreActions }
			rowFormatter={ rowFormatter }
		/>
	);
}
