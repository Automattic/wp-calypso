import PluginCommonList from '../plugin-common/plugin-common-list';
import PluginRowFormatter from '../plugin-row-formatter';
import type { Columns, PluginRowFormatterArgs, Plugin } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactElement } from 'react';

interface Props {
	selectedSite: SiteDetails;
	items: Array< Plugin >;
	isLoading: boolean;
	columns: Columns;
	hasMoreActions?: boolean;
	className?: string;
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
