import { Card, ConfettiAnimation } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { ExternalLink, Notice } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { Dispatch, SetStateAction, useEffect } from 'react';
import pauseSubstackBillingImg from 'calypso/assets/images/importer/pause-substack-billing.png';
import { Steps, StepStatus } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { useResetMutation } from 'calypso/data/paid-newsletter/use-reset-mutation';
import ImporterActionButton from '../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../importer-action-buttons/container';
import ContentSummary from './summary/content';
import SubscribersSummary from './summary/subscribers';
import { EngineTypes } from './types';
import { getImporterStatus, normalizeFromSite } from './utils';

function getStepTitle( importerStatus: StepStatus ) {
	if ( importerStatus === 'done' ) {
		return __( 'Success!' ) + ' 🎉';
	}

	if ( importerStatus === 'importing' ) {
		return __( 'Almost there…' );
	}

	return __( 'Summary' );
}

interface SummaryProps {
	selectedSite: SiteDetails;
	steps: Steps;
	engine: EngineTypes;
	fromSite: string;
	showConfetti: boolean;
	shouldShownConfetti: Dispatch< SetStateAction< boolean > >;
}

export default function Summary( {
	steps,
	selectedSite,
	engine,
	fromSite,
	showConfetti,
	shouldShownConfetti,
}: SummaryProps ) {
	const { __ } = useI18n();
	const { resetPaidNewsletter } = useResetMutation();
	const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	const onButtonClick = () => resetPaidNewsletter( selectedSite.ID, engine, 'content' );
	const paidSubscribersCount = parseInt(
		steps.subscribers.content?.meta?.paid_subscribed_count || '0'
	);
	const showPauseSubstackBillingWarning = paidSubscribersCount > 0;

	useEffect( () => {
		if ( showConfetti ) {
			shouldShownConfetti( false );
		}
	}, [ showConfetti, shouldShownConfetti ] );

	const importerStatus = getImporterStatus( steps.content.status, steps.subscribers.status );

	return (
		<Card>
			{ showConfetti && <ConfettiAnimation trigger={ ! prefersReducedMotion } /> }
			<h2>{ getStepTitle( importerStatus ) }</h2>

			{ steps.content.content && (
				<ContentSummary stepContent={ steps.content.content } status={ steps.content.status } />
			) }

			{ steps.subscribers.content && (
				<SubscribersSummary
					stepContent={ steps.subscribers.content }
					status={ steps.subscribers.status }
				/>
			) }

			{ showPauseSubstackBillingWarning && (
				<Notice status="warning" className="importer__notice" isDismissible={ false }>
					<h2>{ __( 'Action required' ) }</h2>
					{ createInterpolateElement(
						__(
							'To prevent any charges from Substack, go to your <substackPaymentsSettingsLink>Substack Payments Settings</substackPaymentsSettingsLink>, select "Pause billing" and click "<strong>Pause indefinitely</strong>".'
						),
						{
							strong: <strong />,
							substackPaymentsSettingsLink: (
								// @ts-expect-error Used in createInterpolateElement doesn't need children.
								<ExternalLink
									href={ `https://${ normalizeFromSite(
										fromSite
									) }/publish/settings?search=Pause%20subscription` }
								/>
							),
						}
					) }
					<img
						src={ pauseSubstackBillingImg }
						alt={ __( 'Pause Substack billing' ) }
						className="pause-billing"
					/>
				</Notice>
			) }

			<ImporterActionButtonContainer noSpacing>
				<ImporterActionButton
					href={ '/settings/newsletter/' + selectedSite.slug }
					onClick={ onButtonClick }
					primary
				>
					{ __( 'Customize your newsletter' ) }
				</ImporterActionButton>
				<ImporterActionButton href={ '/posts/' + selectedSite.slug } onClick={ onButtonClick }>
					{ __( 'View content' ) }
				</ImporterActionButton>
				<ImporterActionButton
					href={ '/subscribers/' + selectedSite.slug }
					onClick={ onButtonClick }
				>
					{ __( 'Check subscribers' ) }
				</ImporterActionButton>
			</ImporterActionButtonContainer>
		</Card>
	);
}
