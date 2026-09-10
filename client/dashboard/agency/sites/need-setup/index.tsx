import { activeAgencyQuery, pendingAgencySitesQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __, _n } from '@wordpress/i18n';
import { Icon, wordpress } from '@wordpress/icons';
import { ActionList } from '../../../components/action-list';
import EmptyState from '../../../components/empty-state';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { hasWpcomLicenseWithoutSite } from './lib';
import type { PendingAgencySite, ReferralApiResponse } from '@automattic/api-core';
import type { ReactNode } from 'react';

type SetupRow = {
	key: string;
	description: ReactNode;
};

function getReferralDescription( referral: ReferralApiResponse ): ReactNode {
	return createInterpolateElement( __( '<email /> owns this' ), {
		email: <strong>{ referral.client.email }</strong>,
	} );
}

/**
 * Referred licenses are listed one by one so each shows its owner, while the
 * agency's own licenses collapse into a single row: they are interchangeable,
 * so setting one up is the same as setting up any other.
 */
function getSetupRows( pendingSites: PendingAgencySite[] ): SetupRow[] {
	const available = pendingSites.filter( hasWpcomLicenseWithoutSite );

	const rows: SetupRow[] = available.flatMap( ( { id, features } ) => {
		const { referral } = features.wpcom_atomic;
		return referral
			? [ { key: `referral-${ id }`, description: getReferralDescription( referral ) } ]
			: [];
	} );

	const unreferredCount = available.length - rows.length;
	if ( unreferredCount ) {
		rows.push( {
			key: 'available',
			description: sprintf(
				/* translators: %d is the number of licenses available to set up. */
				_n( '%d site available', '%d sites available', unreferredCount ),
				unreferredCount
			),
		} );
	}

	return rows;
}

function NothingToSetUp() {
	return (
		<EmptyState.Wrapper isCompact>
			<EmptyState>
				<EmptyState.Header>
					<EmptyState.Title>{ __( 'Nothing to set up' ) }</EmptyState.Title>
					<EmptyState.Description>
						{ __( 'Every site you have purchased has been created.' ) }
					</EmptyState.Description>
				</EmptyState.Header>
			</EmptyState>
		</EmptyState.Wrapper>
	);
}

function PendingSitesList( { agencyId }: { agencyId: number } ) {
	const { data: pendingSites } = useSuspenseQuery( pendingAgencySitesQuery( agencyId ) );
	const rows = getSetupRows( pendingSites );

	// The route guard redirects when nothing is pending, so this is reached only
	// when the last license is set up while the screen is open.
	if ( ! rows.length ) {
		return <NothingToSetUp />;
	}

	return (
		<ActionList>
			{ rows.map( ( { key, description } ) => (
				<ActionList.ActionItem
					key={ key }
					title={ __( 'WordPress.com' ) }
					description={ description }
					decoration={ <Icon icon={ wordpress } size={ 24 } /> }
					actions={
						<>
							{ /* TODO: open the site configuration modal, then provision the site. */ }
							<Button variant="secondary" size="compact" disabled __next40pxDefaultSize>
								{ __( 'Create new site' ) }
							</Button>
							{ config.isEnabled( 'a4a/site-migration' ) && (
								<Button variant="tertiary" size="compact" disabled __next40pxDefaultSize>
									{ __( 'Migrate an existing site' ) }
								</Button>
							) }
						</>
					}
				/>
			) ) }
		</ActionList>
	);
}

export default function AgencySitesNeedSetup() {
	const { data: agency } = useSuspenseQuery( activeAgencyQuery() );

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Needs setup' ) }
					description={ __( 'Set up the sites you have purchased but not yet configured.' ) }
				/>
			}
		>
			{ agency ? <PendingSitesList agencyId={ agency.id } /> : <NothingToSetUp /> }
		</PageLayout>
	);
}
