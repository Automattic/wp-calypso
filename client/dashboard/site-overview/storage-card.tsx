import { useLoaderData } from '@tanstack/react-router';
import { ExternalLink, __experimentalHeading as Heading } from '@wordpress/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { backup } from '@wordpress/icons';
import filesize from 'filesize';
import OverviewCard, { OverviewCardProgressBar } from './overview-card';
import type { FetchSiteRouteResponse } from '../data/types';

const MINIMUM_DISPLAYED_USAGE = 2.5;

export default function StorageCard() {
	const { mediaStorage: { storageUsedBytes, maxStorageBytes } = {} } = useLoaderData( {
		from: '/sites/$siteId',
	} ) as FetchSiteRouteResponse;
	if ( ! storageUsedBytes || ! maxStorageBytes ) {
		return null;
	}
	let usagePercentage = Math.round( ( ( storageUsedBytes / maxStorageBytes ) * 1000 ) / 10 );
	// Ensure that the displayed usage is never fully empty to
	// avoid a confusing UI and that in never exceeds 100%.
	usagePercentage = Math.min( Math.max( MINIMUM_DISPLAYED_USAGE, usagePercentage ), 100 );
	const used = filesize( storageUsedBytes, { round: 0 } );
	const max = filesize( maxStorageBytes, { round: 0 } );
	return (
		<OverviewCard
			title={ __( 'Storage' ) }
			icon={ backup }
			customHeading={ createInterpolateElement(
				/* translators: %1$s: storage space used, %2$s: maximum available storage space. Eg. '236 MB of 53 GB used' */
				sprintf( __( '<heading>%1$s</heading> <span>of %2$s used</span>' ), used, max ),
				{
					heading: <Heading level={ 2 } style={ { whiteSpace: 'nowrap' } } />,
					span: createElement( 'span' ),
				}
			) }
		>
			<OverviewCardProgressBar value={ usagePercentage } />
			<ExternalLink href="#">{ __( 'Buy more' ) }</ExternalLink>
		</OverviewCard>
	);
}
