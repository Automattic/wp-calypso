import { DATA_CENTER_OPTIONS, getDataCenterOptions } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import SummaryButton from '@automattic/components/src/summary-button';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button, Icon, SelectControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { cloud } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { useAuth } from '../../../../../../app/auth';
import Breadcrumbs from '../../../../../../app/breadcrumbs';
import { Card, CardBody } from '../../../../../../components/card';
import Notice from '../../../../../../components/notice';
import { PageHeader } from '../../../../../../components/page-header';
import PageLayout from '../../../../../../components/page-layout';
import { SectionHeader } from '../../../../../../components/section-header';
import { canDuplicateSite } from '../../../../../../sites/features';
import { useHostedDataCenter } from '../../../../../../sites/primary-data-center/hosted-data-center';
import { wpcomLink } from '../../../../../../utils/link';
import type { DataCenterOption, Site } from '@automattic/api-core';

function CopyToDataCenter( {
	site,
	current,
	recommended,
	available,
}: {
	site: Site;
	current: DataCenterOption;
	recommended: DataCenterOption | null;
	available: DataCenterOption[];
} ) {
	const dataCenterOptions = getDataCenterOptions();
	const targets = ( available.length ? available : DATA_CENTER_OPTIONS ).filter(
		( dataCenter ) => dataCenter !== current
	);
	const [ target, setTarget ] = useState< DataCenterOption | undefined >(
		recommended && targets.includes( recommended ) ? recommended : targets[ 0 ]
	);

	if ( ! target ) {
		return null;
	}

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						title={ __( 'Copy to another data center' ) }
						description={ __(
							'Your site can’t move to another data center, but you can copy it to one. The copy is a new site: you choose its address and plan, and this site stays where it is.'
						) }
						level={ 3 }
					/>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Data center for the copy' ) }
						value={ target }
						options={ targets.map( ( dataCenter ) => ( {
							label: dataCenterOptions[ dataCenter ],
							value: dataCenter,
						} ) ) }
						onChange={ ( value ) => setTarget( value as DataCenterOption ) }
					/>
					<div>
						<Button
							variant="secondary"
							__next40pxDefaultSize
							href={ addQueryArgs( wpcomLink( '/setup/copy-site' ), {
								sourceSlug: site.slug,
								dataCenter: target,
							} ) }
						>
							{ __( 'Copy to this data center' ) }
						</Button>
					</div>
				</VStack>
			</CardBody>
		</Card>
	);
}

export default function PrimaryDataCenterSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { user } = useAuth();
	const { current, recommended, available } = useHostedDataCenter( site );

	const dataCenterOptions = getDataCenterOptions();
	const badges = current ? [ { text: dataCenterOptions[ current ] } ] : undefined;
	const canCopy = !! current && ! site.is_wpcom_staging_site && canDuplicateSite( site, user );
	const showRecommendation = !! current && !! recommended && recommended !== current;

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Primary data center' ) }
					description={ __(
						'The primary data center is where your site is physically located. For redundancy, your site also replicates in real-time to a second data center in a different region.'
					) }
				/>
			}
		>
			<VStack spacing={ 8 }>
				{ showRecommendation ? (
					<Notice>
						{ sprintf(
							/* translators: %s: a data center, e.g. "EU West (Amsterdam, Netherlands)". */
							__(
								'Most of your visitors are closer to %s. A copy of your site in that data center could load faster for them.'
							),
							dataCenterOptions[ recommended ]
						) }
					</Notice>
				) : (
					! canCopy && (
						<Notice>
							{ __(
								'Your site has already been placed in the optimal data center. It’s not currently possible to change your primary data center.'
							) }
						</Notice>
					)
				) }
				<Card>
					<VStack>
						<SummaryButton
							title={ __( 'Primary data center' ) }
							density="medium"
							decoration={ <Icon icon={ cloud } /> }
							showArrow={ false }
							disabled
							badges={ badges }
						/>
					</VStack>
				</Card>
				{ canCopy && user && (
					<CopyToDataCenter
						site={ site }
						current={ current }
						recommended={ recommended }
						available={ available }
					/>
				) }
			</VStack>
		</PageLayout>
	);
}
