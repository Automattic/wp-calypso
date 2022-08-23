import { Card as CardComponent } from '@automattic/components';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import Card from '../card';
import Table from '../table';
import type { Columns, RowFormatterArgs } from '../../types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

interface Props {
	selectedSite: SiteData;
	items: Array< any >;
	isLoading: boolean;
	columns: Columns;
	title?: ReactNode;
	hasMoreActions: boolean;
	primaryKey: string;
	rowFormatter: ( args: RowFormatterArgs ) => ReactNode;
}

export default function List( {
	items,
	title,
	isLoading,
	primaryKey,
	selectedSite,
	...rest
}: Props ): ReactElement {
	return (
		<>
			<Table { ...rest } items={ items } isLoading={ isLoading } primaryKey={ primaryKey } />
			<div className="list__mobile-view">
				<>
					{ title && (
						<CardComponent className="list__content-header">
							<div>{ title }</div>
						</CardComponent>
					) }

					{ isLoading ? (
						<CardComponent>
							<TextPlaceholder />
						</CardComponent>
					) : (
						items.map( ( item ) => (
							<Card
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
