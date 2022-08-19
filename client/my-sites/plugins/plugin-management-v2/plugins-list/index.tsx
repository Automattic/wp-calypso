import { Card } from '@automattic/components';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import PluginCard from '../plugin-card';
import PluginsTable from '../plugins-table';
import type { PluginColumns, PluginRowFormatterArgs } from '../types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

interface Props {
	selectedSite: SiteData;
	items: Array< any >;
	isLoading: boolean;
	columns: PluginColumns;
	title?: ReactNode;
	rowFormatter: ( args: PluginRowFormatterArgs ) => ReactNode;
	hasMoreActions?: boolean;
	primaryKey: string;
}

export default function PluginsList( {
	hasMoreActions = true,
	primaryKey,
	...rest
}: Props ): ReactElement {
	return (
		<>
			<PluginsTable { ...rest } hasMoreActions={ hasMoreActions } primaryKey={ primaryKey } />
			<div className="plugins-list__mobile-view">
				<>
					{ rest.title && (
						<Card className="plugins-list__content-header">
							<div>{ rest.title }</div>
						</Card>
					) }

					{ rest.isLoading ? (
						<Card>
							<TextPlaceholder />
						</Card>
					) : (
						rest.items.map( ( item ) => (
							<PluginCard
								{ ...rest }
								key={ item[ primaryKey ] }
								item={ item }
								hasMoreActions={ hasMoreActions }
							/>
						) )
					) }
				</>
			</div>
		</>
	);
}
