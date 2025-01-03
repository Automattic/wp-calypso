import { useDispatch } from 'calypso/state';
import { updatePlugin } from 'calypso/state/plugins/installed/actions';
import PluginCommonList from '../plugin-common/plugin-common-list';
import PluginRowFormatter from '../plugin-row-formatter';
import type { Columns, SiteRowFormatterArgs, PluginComponentProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactElement } from 'react';

interface Props {
	selectedSite?: SiteDetails;
	items: Array< SiteDetails | null | undefined >;
	isLoading: boolean;
	columns: Columns;
	plugin: PluginComponentProps;
	renderActions?: ( args: any ) => ReactElement;
}

export default function SitesList( { selectedSite, plugin, ...rest }: Props ) {
	const dispatch = useDispatch();

	const rowFormatter = ( { item, ...rest }: SiteRowFormatterArgs ) => {
		const handleUpdatePlugin = () => {
			dispatch( updatePlugin( item.ID, plugin ) );
		};

		return (
			<PluginRowFormatter
				{ ...rest }
				item={ plugin }
				selectedSite={ item }
				updatePlugin={ handleUpdatePlugin }
			/>
		);
	};

	return (
		<PluginCommonList
			{ ...rest }
			selectedSite={ selectedSite }
			rowFormatter={ rowFormatter }
			primaryKey="ID"
		/>
	);
}
