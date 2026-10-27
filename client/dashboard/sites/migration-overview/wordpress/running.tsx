import { __experimentalVStack as VStack, Button, ProgressBar } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useAuth } from '../../../app/auth';
import { useHelpCenter } from '../../../app/help-center';
import Grid from '../../../components/grid';
import { Text } from '../../../components/text';
import { MigrationCard, StatusIcon } from './migration-card';
import type { WordPressMigrationStatus } from '@automattic/api-core';
import './style.scss';

type Phase = WordPressMigrationStatus[ 'phase' ];

export function Running( { phase, sourceHost }: { phase: Phase; sourceHost: string } ) {
	const { user } = useAuth();
	const { setShowHelpCenter } = useHelpCenter();

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
			<Text variant="muted">
				{ sprintf(
					/* translators: %s: the email address of the current user. */
					__(
						'You can leave this page. The migration carries on in the background. We will email you at %s when the migration is ready.'
					),
					user.email
				) }
			</Text>
		</MigrationCard>
	);
}
