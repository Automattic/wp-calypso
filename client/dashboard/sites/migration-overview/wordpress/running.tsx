import { __experimentalVStack as VStack, Button, ProgressBar } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { useState } from 'react';
import { useHelpCenter } from '../../../app/help-center';
import Grid from '../../../components/grid';
import { Text } from '../../../components/text';
import { MigrationCard, StatusIcon } from './migration-card';
import type { WordPressMigrationStatus } from '@automattic/api-core';
import './style.scss';

type Phase = WordPressMigrationStatus[ 'phase' ];

// The steps a customer sees, each covering one or more of the run's phases.
export const MIGRATION_STEPS: { label: string; phases: Phase[] }[] = [
	{ label: __( 'Verifying' ), phases: [ 'prepare-source', 'prepare-destination', 'preflight' ] },
	{ label: __( 'Copying' ), phases: [ 'migration' ] },
	{ label: __( 'Finishing' ), phases: [ 'cleanup' ] },
];

export function Running( {
	phase,
	progress,
	sourceHost,
	notificationEmails,
}: {
	phase: Phase;
	progress: WordPressMigrationStatus[ 'progress' ];
	sourceHost: string;
	notificationEmails: string[];
} ) {
	const { setShowHelpCenter } = useHelpCenter();

	// Only the viewer's own address is listed when they're one of the recipients.
	const [ email ] = notificationEmails;

	const currentStep = MIGRATION_STEPS.findIndex( ( { phases } ) => phases.includes( phase ) );

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
					{ __( 'Have a question? Contact us' ) }
				</Button>
			}
			note={
				// Keyed, so losing the email swaps the whole element; avoids a Google Translate DOM crash (react/react#11538).
				<Text key={ email ? 'email' : 'background' } variant="muted">
					{ email
						? createInterpolateElement(
								/* translators: <email /> is the address we notify when the migration is ready, e.g. a@example.com. */
								__( 'You can leave this page. We’ll email <email /> when it’s done.' ),
								{ email: <strong>{ email }</strong> }
							)
						: __(
								'You can leave this page. The migration will continue running in the background.'
							) }
				</Text>
			}
		>
			<Grid columns={ MIGRATION_STEPS.length } gap="sm">
				{ MIGRATION_STEPS.map( ( { label }, index ) => {
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
			{ progress && <ProgressMessage message={ progress.message } /> }
		</MigrationCard>
	);
}

function ProgressMessage( { message }: { message: string } ) {
	const [ shown, setShown ] = useState( message );
	const [ leaving, setLeaving ] = useState< string | null >( null );

	if ( message !== shown ) {
		setLeaving( shown );
		setShown( message );
	}

	return (
		<div role="status" className="wordpress-migration__progress-message">
			{ /* Keyed by message, so the outgoing line keeps its node (and any page translation) as it rolls out. */ }
			{ [ leaving, shown ].map(
				( line ) =>
					line && (
						<Text
							key={ line }
							aria-hidden={ line === leaving || undefined }
							variant="muted"
							className={ clsx( 'wordpress-migration__progress-message-line', {
								'is-leaving': line === leaving,
								// Only a message replacing another rolls in; the first one is just there.
								'is-entering': line === shown && leaving,
							} ) }
							onAnimationEnd={ line === leaving ? () => setLeaving( null ) : undefined }
						>
							{ line }
						</Text>
					)
			) }
		</div>
	);
}
