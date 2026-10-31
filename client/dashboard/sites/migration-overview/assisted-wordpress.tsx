import {
	siteWordPressMigrationCancelHandoffMutation,
	siteWordPressMigrationStatusQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { Text } from '../../components/text';
import { wpcomLink } from '../../utils/link';
import { WhatToExpect } from './what-to-expect';
import { MigrationCard, StatusIcon } from './wordpress/migration-card';
import { MIGRATION_STEPS } from './wordpress/running';
import type {
	Site,
	WordPressMigrationFinding,
	WordPressMigrationStatus,
} from '@automattic/api-core';

/**
 * A WordPress migration handed to our team. The customer can take it back until our team runs it,
 * then only ask our team to stop.
 */
export function AssistedWordPressMigration( { site }: { site: Site } ) {
	const status = site.site_migration.status_v2;
	const isInProgress = status === 'in_progress';
	const cancel = useMutation(
		withSnackbar( siteWordPressMigrationCancelHandoffMutation( site.ID ), {
			success: isInProgress
				? __( 'We’ve asked our team to stop your migration.' )
				: __( 'Your migration is back with you.' ),
			error: __( 'We couldn’t cancel the request. Please try again.' ),
		} )
	);

	const cancelButton = (
		<Button
			// Beside "Share access" while pending, after that the card's only action, so it sits in its footer.
			variant={ status === 'pending' ? 'secondary' : 'link' }
			__next40pxDefaultSize
			className={ status === 'pending' ? undefined : 'wordpress-migration__note-link' }
			isBusy={ cancel.isPending }
			disabled={ cancel.isPending || cancel.isSuccess }
			onClick={ () => cancel.mutate() }
		>
			{ getCancelLabel( status ) }
		</Button>
	);

	if ( status === 'pending' ) {
		return <Pending site={ site } cancelButton={ cancelButton } />;
	}

	return (
		<MigrationCard
			title={ __( 'We’ve received your migration request' ) }
			description={ __( 'We will review your site to make sure we have everything we need.' ) }
			decoration={ <StatusIcon status="pending" /> }
			note={ cancelButton }
		>
			<WhatToExpect />
		</MigrationCard>
	);
}

// Before our team has a ticket, cancelling just hands the migration back. After, it withdraws the request, and once
// our team is running it, it only asks them to stop.
function getCancelLabel( status: Site[ 'site_migration' ][ 'status_v2' ] ) {
	if ( status === 'pending' ) {
		return __( 'Continue on my own' );
	}

	return status === 'in_progress' ? __( 'Request cancellation' ) : __( 'Cancel the request' );
}

/**
 * Where the customer gives our team access to their site: the Stepper's credentials step.
 */
export function getShareAccessUrl( site: Site, sourceUrl?: string | null ) {
	return addQueryArgs( wpcomLink( '/setup/site-migration/site-migration-credentials' ), {
		siteId: site.ID,
		siteSlug: site.slug,
		from: sourceUrl ?? undefined,
		ref: 'hosting-migration-overview',
	} );
}

/**
 * Waiting on the customer to give our team access to their site.
 */
function Pending( { site, cancelButton }: { site: Site; cancelButton: React.ReactNode } ) {
	const { data: migration, isPending } = useQuery( siteWordPressMigrationStatusQuery( site.ID ) );

	// Which copy fits depends on why our team has it, so wait to know.
	if ( isPending ) {
		return null;
	}

	// A failed run handed our migration over. The customer sees what stopped it if they take it back and try again.
	const stoppedBy = migration?.findings.find(
		( { resolution } ) => resolution === 'assisted_handoff'
	);
	const isAfterFailure = !! stoppedBy;

	return (
		<MigrationCard
			title={
				isAfterFailure
					? __( 'Something went wrong, but our team can take it from here' )
					: __( 'Give our team access to your site' )
			}
			description={
				isAfterFailure
					? __(
							'Your migration ran into an error. Share access to your WordPress site, and our migration specialists will handle everything for you.'
						)
					: __(
							'To migrate your site for you, our team needs access to your WordPress site. It only takes a minute.'
						)
			}
			decoration={ <StatusIcon status={ isAfterFailure ? 'error' : 'pending' } /> }
			actions={
				<>
					<Button
						__next40pxDefaultSize
						variant="primary"
						href={ getShareAccessUrl( site, migration?.source_url ) }
					>
						{ __( 'Share access' ) }
					</Button>
					{ cancelButton }
				</>
			}
		>
			{ stoppedBy && <StoppedBy finding={ stoppedBy } phase={ migration?.phase ?? null } /> }
		</MigrationCard>
	);
}

/**
 * The error that stopped the run, and the step it was on.
 */
function StoppedBy( {
	finding,
	phase,
}: {
	finding: WordPressMigrationFinding;
	phase: WordPressMigrationStatus[ 'phase' ];
} ) {
	const step = MIGRATION_STEPS.find( ( { phases } ) => phases.includes( phase ) );

	return (
		<VStack spacing={ 1 } className="wordpress-migration__details">
			<Text weight={ 500 }>{ __( 'What stopped the migration' ) }</Text>
			<Text>{ finding.message }</Text>
			{ step && (
				<Text variant="muted">
					{
						/* translators: %s: the step the migration was on, e.g. Copying. */
						sprintf( __( 'Step: %s' ), step.label )
					}
				</Text>
			) }
		</VStack>
	);
}
