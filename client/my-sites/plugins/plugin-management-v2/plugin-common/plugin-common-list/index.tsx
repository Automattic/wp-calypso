import { Card } from '@automattic/components';
import clsx from 'clsx';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import PluginCommonCard from '../plugin-common-card';
import PluginCommonTable from '../plugin-common-table';
import type { Columns, RowFormatterArgs } from '../../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

interface Props {
	selectedSite?: SiteDetails;
	items: Array< any >;
	isLoading: boolean;
	columns: Columns;
	renderActions?: ( args: any ) => ReactElement;
	primaryKey: string;
	rowFormatter: ( args: RowFormatterArgs ) => ReactNode;
}

export default function PluginCommonList( {
	items,
	isLoading,
	primaryKey,
	selectedSite,
	...rest
}: Props ) {
	return (
		<>
			<div className={ clsx( { 'plugin-common-multi-site-table': ! selectedSite } ) }>
				<PluginCommonTable
					{ ...rest }
					items={ items }
					isLoading={ isLoading }
					primaryKey={ primaryKey }
				/>
			</div>

			<div className="plugin-common-list__mobile-view">
				<>
					{ isLoading ? (
						<Card>
							<TextPlaceholder />
						</Card>
					) : (
						items.map( ( item ) => (
							<PluginCommonCard
								{ ...rest }
								selectedSite={ selectedSite }
								key={ item[ primaryKey ] }
								item={ item }
							/>
						) )
					) }
				</>
			</div>
		</>
	);
}
