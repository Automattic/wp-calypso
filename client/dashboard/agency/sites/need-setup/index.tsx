import { activeAgencyQuery, pendingAgencySitesQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __, _n } from '@wordpress/i18n';
import { Icon, wordpress } from '@wordpress/icons';
import { ActionList } from '../../../components/action-list';
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
	return createInterpolateElement(
		sprintf(
			/* translators: %s is the email address of the client who owns the license. */
			__( '<b>%s</b> owns this' ),
			referral.client.email
		),
		{ b: <strong /> }
	);
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

export default function AgencySitesNeedSetup() {
	const { data: agency } = useSuspenseQuery( activeAgencyQuery() );
	const { data: pendingSites = [] } = useQuery( {
		...pendingAgencySitesQuery( agency?.id ?? 0 ),
		enabled: !! agency?.id,
	} );

	const rows = getSetupRows( pendingSites );

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Needs setup' ) }
					description={ __( 'Set up the sites you have purchased but not yet configured.' ) }
				/>
			}
		>
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
		</PageLayout>
	);
}
