import { siteWordPressMigrationRunMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useHelpCenter } from '../../../app/help-center';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import Notice from '../../../components/notice';
import { AssistedHandoffLink, MigrationCard, StatusIcon } from './migration-card';
import type {
	Site,
	WordPressMigrationFinding,
	WordPressMigrationStatus,
} from '@automattic/api-core';

export function Findings( {
	site,
	migration,
}: {
	site: Site;
	migration: WordPressMigrationStatus;
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

	const getDescription = () => {
		if ( isFailed ) {
			return __( 'Something went wrong and the migration couldn’t finish.' );
		}
		return findings.length > 0
			? __( 'We checked your site and found a few things you should know about.' )
			: __( 'We checked your site and it’s ready to migrate.' );
	};

	const getStatus = () => {
		if ( isFailed || findings.some( ( { severity } ) => severity === 'failure' ) ) {
			return 'error';
		}
		return findings.length > 0 ? 'warning' : 'pending';
	};

	return (
		<MigrationCard
			title={ isFailed ? __( 'Your migration stopped' ) : __( 'Before we migrate your site' ) }
			description={ getDescription() }
			decoration={ <StatusIcon status={ getStatus() } /> }
			actions={
				<>
					<Button
						__next40pxDefaultSize
						variant="primary"
						isBusy={ run.isPending }
						disabled={ run.isPending }
						onClick={ () => run.mutate( { accept_findings: codes } ) }
					>
						{ isRetry ? __( 'Try again' ) : __( 'Continue' ) }
					</Button>
					<Button variant="link" onClick={ () => setShowHelpCenter( true ) }>
						{ __( 'Contact us' ) }
					</Button>
				</>
			}
			footer={ <AssistedHandoffLink /> }
		>
			{ findings.map( ( finding, index ) => (
				<Notice
					key={ `${ finding.code }-${ index }` }
					variant={ finding.severity === 'failure' ? 'error' : 'warning' }
					title={ finding.label }
				>
					{ getMessage( finding ) }
				</Notice>
			) ) }
		</MigrationCard>
	);
}

// The server's message, except where the finding's data reads better set apart from the text.
function getMessage( { code, message, data }: WordPressMigrationFinding ) {
	if (
		code === 'source_redirect' &&
		typeof data?.from === 'string' &&
		typeof data?.to === 'string'
	) {
		return createInterpolateElement(
			__( 'Your site redirects from <from /> to <to />. Continue to migrate from <to /> instead.' ),
			{
				from: <code>{ getDisplayAddress( data.from ) }</code>,
				to: <code>{ getDisplayAddress( data.to ) }</code>,
			}
		);
	}

	return message;
}

// e.g. "https://www.example.com/" → "www.example.com". Redirects between http and https are followed, never shown.
function getDisplayAddress( url: string ) {
	return url.replace( /^https?:\/\//, '' ).replace( /\/$/, '' );
}
