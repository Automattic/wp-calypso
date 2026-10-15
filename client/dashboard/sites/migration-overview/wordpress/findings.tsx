import { siteWordPressMigrationRunMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useHelpCenter } from '../../../app/help-center';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import Notice from '../../../components/notice';
import { MigrationCard } from './migration-card';
import type { Site, WordPressMigrationStatus } from '@automattic/api-core';

export function Findings( {
	site,
	migration,
	onReconnect,
}: {
	site: Site;
	migration: WordPressMigrationStatus;
	onReconnect: () => void;
} ) {
	const { setShowHelpCenter } = useHelpCenter();
	const run = useMutation(
		withSnackbar( siteWordPressMigrationRunMutation( site.ID ), {
			error: __( 'Failed to continue the migration.' ),
		} )
	);

	const { findings } = migration;
	const codes = findings.map( ( { code } ) => code );
	const isFailed = migration.status === 'failed';
	// Continuing past a `retry` finding only runs the same step again.
	const isRetry = findings.some( ( { resolution } ) => resolution === 'retry' );
	const isReconnect = findings.some( ( { resolution } ) => resolution === 'reconnect' );

	const getDescription = () => {
		if ( isFailed ) {
			return __( 'Something went wrong and the migration couldn’t finish.' );
		}
		return findings.length > 0
			? __( 'We checked your site and found a few things you should know about.' )
			: __( 'We checked your site and it’s ready to migrate.' );
	};

	return (
		<MigrationCard
			title={ isFailed ? __( 'Your migration stopped' ) : __( 'Before we migrate your site' ) }
			description={ getDescription() }
			actions={
				<>
					{ isReconnect ? (
						<Button __next40pxDefaultSize variant="primary" onClick={ onReconnect }>
							{ __( 'Reconnect your site' ) }
						</Button>
					) : (
						<Button
							__next40pxDefaultSize
							variant="primary"
							isBusy={ run.isPending }
							disabled={ run.isPending }
							onClick={ () => run.mutate( { accept_findings: codes } ) }
						>
							{ isRetry ? __( 'Try again' ) : __( 'Continue' ) }
						</Button>
					) }
					<Button variant="link" onClick={ () => setShowHelpCenter( true ) }>
						{ __( 'Contact us' ) }
					</Button>
				</>
			}
		>
			{ findings.map( ( { code, severity, label, message }, index ) => (
				<Notice
					key={ `${ code }-${ index }` }
					variant={ severity === 'failure' ? 'error' : 'warning' }
					title={ label }
				>
					{ message }
				</Notice>
			) ) }
		</MigrationCard>
	);
}
