import { __experimentalVStack as VStack, Button, ProgressBar } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useAuth } from '../../../app/auth';
import { useHelpCenter } from '../../../app/help-center';
import { useIntlLocale } from '../../../app/locale';
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
	const { user } = useAuth();
	const locale = useIntlLocale();
	const { setShowHelpCenter } = useHelpCenter();

	// Name only the viewer's own address when they're among the recipients.
	const ownEmail = notificationEmails.find(
		( email ) => email.toLowerCase() === user.email.toLowerCase()
	);
	const recipients = new Intl.ListFormat( locale, { type: 'conjunction' } ).format(
		ownEmail ? [ ownEmail ] : notificationEmails
	);

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
				{ notificationEmails.length
					? sprintf(
							/* translators: %s: the email addresses we notify when the migration is ready, e.g. "a@example.com and b@example.com". */
							__(
								'You can leave this page. The migration carries on in the background. We will email you at %s when the migration is ready.'
							),
							recipients
						)
					: __( 'You can leave this page. The migration carries on in the background.' ) }
			</Text>
		</MigrationCard>
	);
}
