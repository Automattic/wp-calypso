import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import SiteCard from '../site-card';
import SiteTable from '../site-table';
import { formatSites } from '../utils';
import type { ReactElement } from 'react';

import './style.scss';

interface Props {
	data: Array< any > | undefined;
	isError: boolean;
	isFetching: boolean;
}

export default function SiteContent( { data, isError, isFetching }: Props ): ReactElement {
	const translate = useTranslate();

	const sites = formatSites( data );

	const columns = [
		{
			key: 'site',
			title: translate( 'Site' ),
		},
		{
			key: 'backup',
			title: translate( 'Backup' ),
		},
		{
			key: 'scan',
			title: translate( 'Scan' ),
		},
		{
			key: 'monitor',
			title: translate( 'Monitor' ),
		},
		{
			key: 'plugin',
			title: translate( 'Plugin Updates' ),
		},
	];

	if ( ! isFetching && ! isError && ! sites.length ) {
		return <div className="site-content__no-sites">{ translate( 'No active sites' ) }</div>;
	}

	return (
		<>
			<SiteTable isFetching={ isFetching } columns={ columns } items={ sites } />
			<div className="site-content__mobile-view">
				<>
					{ isFetching ? (
						<Card>
							<TextPlaceholder />
						</Card>
					) : (
						<>
							{ sites.length > 0 &&
								sites.map( ( rows, index ) => (
									<SiteCard key={ index } columns={ columns } rows={ rows } />
								) ) }
						</>
					) }
				</>
			</div>
		</>
	);
}
