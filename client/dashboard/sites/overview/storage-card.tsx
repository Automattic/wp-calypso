import { useQuery } from '@tanstack/react-query';
import {
	ExternalLink,
	__experimentalHeading as Heading,
	VisuallyHidden,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { backup } from '@wordpress/icons';
import filesize from 'filesize';
import { siteMediaStorageQuery } from '../../app/queries';
import OverviewCard, { OverviewCardProgressBar } from '../overview-card';

const MINIMUM_DISPLAYED_USAGE = 2.5;

export default function StorageCard( { siteSlug }: { siteSlug: string } ) {
	const { data: mediaStorage } = useQuery( siteMediaStorageQuery( siteSlug ) );
	return (
		<OverviewCard
			title={ __( 'Storage' ) }
			icon={ backup }
			customHeading={
				mediaStorage ? (
					createInterpolateElement(
						sprintf(
							/* translators: %1$s: storage space used, %2$s: maximum available storage space. Eg. '236 MB of 53 GB used' */
							__( '<heading>%1$s</heading> <span>of %2$s used</span>' ),
							filesize( mediaStorage.storageUsedBytes, { round: 0 } ),
							filesize( mediaStorage.maxStorageBytes, { round: 0 } )
						),
						{
							heading: (
								// @ts-expect-error children prop is injected by createInterpolateElement
								<Heading level={ 2 } style={ { whiteSpace: 'nowrap' } } />
							),
							span: <span />,
						}
					)
				) : (
					<Heading level={ 2 } style={ { whiteSpace: 'nowrap' } }>
						{ '\u00A0' }
						<VisuallyHidden>{ __( 'Loading…' ) }</VisuallyHidden>
					</Heading>
				)
			}
		>
			<OverviewCardProgressBar
				value={
					// Ensure that the displayed usage is never fully empty to
					// avoid a confusing UI and that in never exceeds 100%.
					mediaStorage
						? Math.min(
								Math.max(
									MINIMUM_DISPLAYED_USAGE,
									Math.round(
										( ( mediaStorage.storageUsedBytes / mediaStorage.maxStorageBytes ) * 1000 ) / 10
									)
								),
								100
						  )
						: undefined
				}
			/>
			<ExternalLink href="#">{ __( 'Buy more' ) }</ExternalLink>
		</OverviewCard>
	);
}
