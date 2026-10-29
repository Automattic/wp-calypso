import { __experimentalVStack as VStack, Button, ProgressBar } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useHelpCenter } from '../../../app/help-center';
import Grid from '../../../components/grid';
import { Text } from '../../../components/text';
import { MigrationCard, StatusIcon } from './migration-card';
import type { WordPressMigrationStatus } from '@automattic/api-core';
import './style.scss';

type Phase = WordPressMigrationStatus[ 'phase' ];

export function Running( {
	phase,
	sourceHost,
	notificationEmails,
}: {
	phase: Phase;
	sourceHost: string;
	notificationEmails: string[];
} ) {
	const { setShowHelpCenter } = useHelpCenter();

	// Only the viewer's own address is listed when they're one of the recipients.
	const [ email ] = notificationEmails;

	const steps: { label: string; phases: Phase[] }[] = [
		{ label: __( 'Verifying' ), phases: [ 'prepare-source', 'prepare-destination', 'preflight' ] },
		{ label: __( 'Copying' ), phases: [ 'migration' ] },
		{ label: __( 'Finishing' ), phases: [ 'cleanup' ] },
	];
	const currentStep = steps.findIndex( ( { phases } ) => phases.includes( phase ) );

	return (
		<MigrationCard
			title={ sprintf(
				/* translators: %s: the domain of the site being migrated, e.g. example.com. */
				__( 'Migrating %s' ),
				sourceHost
			) }
			decoration={ <StatusIcon status="pending" /> }
			actions={
				<Button variant="link" onClick={ () => setShowHelpCenter( true ) }>
					{ __( 'Something wrong? Contact us' ) }
				</Button>
			}
			note={
				<VStack spacing={ 1 }>
					<Text variant="muted">
						{ __(
							'You can leave this page. The migration will continue running in the background.'
						) }
					</Text>
					{ email && (
						<Text variant="muted">
							{ createInterpolateElement(
								/* translators: <email /> is the address we notify when the migration is ready, e.g. a@example.com. */
								__( 'We will email you at <email /> once the migration has completed.' ),
								{ email: <strong>{ email }</strong> }
							) }
						</Text>
					) }
				</VStack>
			}
		>
			<Grid columns={ steps.length } gap="sm">
				{ steps.map( ( { label }, index ) => {
					const settledValue = index < currentStep ? 100 : 0;
					return (
						<VStack key={ label } spacing={ 2 }>
							<ProgressBar
								className="wordpress-migration__progress-bar"
								aria-label={ label }
								// No value animates the bar, which marks the step in progress.
								value={ index === currentStep ? undefined : settledValue }
							/>
							<Text variant="muted">{ label }</Text>
						</VStack>
					);
				} ) }
			</Grid>
		</MigrationCard>
	);
}
