import { siteApmDetailQuery, siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	SelectControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import Breadcrumbs from '../../../../app/breadcrumbs';
import { Card, CardBody, CardHeader } from '../../../../components/card';
import { PageHeader } from '../../../../components/page-header';
import PageLayout from '../../../../components/page-layout';
import { Text } from '../../../../components/text';
import { getStoredOrDefaultTimeframe, TIMEFRAME_SECONDS } from '../timeframe';
import SpanTree from './span-tree';
import type { ApmDetailEntry } from '@automattic/api-core';

function formatBucketLabel( entry: ApmDetailEntry ): string {
	const { bucket_minute, transactions_in_bucket } = entry.extra;
	const date = new Date( bucket_minute );
	const time = isNaN( date.getTime() ) ? bucket_minute : date.toLocaleString();
	return sprintf(
		/* translators: 1: a date/time, 2: a number of transactions captured in that minute. */
		__( '%1$s (%2$d tx)' ),
		time,
		transactions_in_bucket
	);
}

export default function RequestDetail( {
	siteSlug,
	method,
	route,
	bucket,
}: {
	siteSlug: string;
	method: string;
	route: string;
	bucket?: string;
} ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const windowSec = TIMEFRAME_SECONDS[ getStoredOrDefaultTimeframe() ];
	const { data } = useSuspenseQuery( siteApmDetailQuery( site.ID, { method, route, windowSec } ) );
	const navigate = useNavigate();

	const sortedDetails = useMemo(
		() =>
			[ ...data.details ].sort( ( a, b ) =>
				b.extra.bucket_minute.localeCompare( a.extra.bucket_minute )
			),
		[ data.details ]
	);

	// Bucket lives in the URL so it's shareable and survives navigation. Fall
	// back to the newest available bucket when the URL doesn't pin one or the
	// pinned bucket has fallen out of the window.
	const selected =
		( bucket && sortedDetails.find( ( d ) => d.extra.bucket_minute === bucket ) ) ||
		sortedDetails[ 0 ];

	const title = `${ method } ${ route }`;

	if ( ! selected ) {
		return (
			<PageLayout header={ <PageHeader prefix={ <Breadcrumbs length={ 3 } /> } title={ title } /> }>
				<Card>
					<CardBody>
						<Text variant="muted">
							{ __( 'No detailed data was captured for this request in the selected timeframe.' ) }
						</Text>
					</CardBody>
				</Card>
			</PageLayout>
		);
	}

	const bucketOptions = sortedDetails.map( ( entry ) => ( {
		label: formatBucketLabel( entry ),
		value: entry.extra.bucket_minute,
	} ) );

	return (
		<PageLayout header={ <PageHeader prefix={ <Breadcrumbs length={ 3 } /> } title={ title } /> }>
			<VStack spacing={ 4 }>
				<Card>
					<CardHeader>
						<HStack justify="space-between" alignment="flex-start" wrap spacing={ 4 }>
							<VStack spacing={ 1 } alignment="flex-start">
								<Text weight={ 600 }>{ title }</Text>
								{ selected.extra.request.hostname && (
									<Text variant="muted">{ selected.extra.request.hostname }</Text>
								) }
								<Text variant="muted" size={ 12 }>
									{ sprintf(
										/* translators: %d is a number of transactions. */
										__( '%d transactions in this minute.' ),
										selected.extra.transactions_in_bucket
									) }
								</Text>
							</VStack>
							<div style={ { minWidth: 240 } }>
								<SelectControl
									label={ __( 'Minute' ) }
									value={ selected.extra.bucket_minute }
									options={ bucketOptions }
									onChange={ ( value ) =>
										navigate( {
											to: '.',
											search: ( prev: Record< string, unknown > ) => ( {
												...prev,
												bucket: value,
											} ),
										} )
									}
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
							</div>
						</HStack>
					</CardHeader>
					<CardBody>
						<SpanTree spans={ selected.extra.spans } pruned={ selected.extra.pruned } />
					</CardBody>
				</Card>
			</VStack>
		</PageLayout>
	);
}
