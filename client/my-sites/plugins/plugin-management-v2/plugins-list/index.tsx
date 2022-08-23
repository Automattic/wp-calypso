import { Card } from '@automattic/components';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import PluginCard from '../plugin-card';
import PluginRowFormatter from '../plugin-row-formatter';
import PluginsTable from '../plugins-table';
import type { Columns, PluginRowFormatterArgs, Plugin } from '../types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

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
	items,
	title,
	isLoading,
	hasMoreActions = true,
	primaryKey,
	selectedSite,
	...rest
}: Props ): ReactElement {
	const rowFormatter = ( props: PluginRowFormatterArgs ) => {
		return <PluginRowFormatter { ...props } selectedSite={ selectedSite } />;
	};

	return (
		<>
			<PluginsTable
				{ ...rest }
				rowFormatter={ rowFormatter }
				items={ items }
				isLoading={ isLoading }
				hasMoreActions={ hasMoreActions }
				primaryKey={ primaryKey }
			/>
			<div className="plugins-list__mobile-view">
				<>
					{ title && (
						<Card className="plugins-list__content-header">
							<div>{ title }</div>
						</Card>
					) }

					{ isLoading ? (
						<Card>
							<TextPlaceholder />
						</Card>
					) : (
						items.map( ( item ) => (
							<PluginCard
								{ ...rest }
								selectedSite={ selectedSite }
								rowFormatter={ rowFormatter }
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
