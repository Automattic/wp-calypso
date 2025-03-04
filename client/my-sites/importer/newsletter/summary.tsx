import { Card, ConfettiAnimation } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { ProgressBar, ExternalLink, Notice } from '@wordpress/components';
import { useReducedMotion } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { Dispatch, SetStateAction, useEffect } from 'react';
import pauseSubstackBillingImg from 'calypso/assets/images/importer/pause-substack-billing.png';
import { Steps, StepStatus } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { useResetMutation } from 'calypso/data/paid-newsletter/use-reset-mutation';
import { useSelector } from 'calypso/state';
import { isJetpackSite, getSiteAdminUrl } from 'calypso/state/sites/selectors';
import ImporterActionButton from '../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../importer-action-buttons/container';
import ContentSummary from './summary/content';
import SubscribersSummary from './summary/subscribers';
import { EngineTypes } from './types';
import { getImporterStatus, normalizeFromSite } from './utils';

interface SummaryProps {
	selectedSite: SiteDetails;
	steps: Steps;
	engine: EngineTypes;
	fromSite: string;
	showConfetti: boolean;
	shouldShownConfetti: Dispatch< SetStateAction< boolean > >;
}

function getSummaryDescription( contentStepStatus: StepStatus, subscribersStepStatus: StepStatus ) {
	const skippedContent = contentStepStatus === 'skipped';
	const skippedSubscribers = subscribersStepStatus === 'skipped';

	if ( ! skippedContent && ! skippedSubscribers ) {
		return __( 'We’re importing your content and subscribers' );
	}

	if ( ! skippedContent ) {
		return __( 'We’re importing your content' );
	}

	if ( ! skippedSubscribers ) {
		return __( 'We’re importing your subscribers' );
	}

	return null;
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
	const prefersReducedMotion = useReducedMotion();
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite.ID ) );
	const siteAdmminUrl = useSelector( ( state ) => getSiteAdminUrl( state, selectedSite.ID ) );

	const resetImporter = () => resetPaidNewsletter( selectedSite.ID, engine, 'content', fromSite );
	const paidSubscribersCount = parseInt(
		steps.subscribers.content?.meta?.paid_subscribed_count || '0'
	);
	const showPauseSubstackBillingWarning = paidSubscribersCount > 0;

	useEffect( () => {
		if ( showConfetti ) {
			shouldShownConfetti( false );
		}
	}, [ showConfetti, shouldShownConfetti ] );

	// Combined status of subscriber & content importer
	const importerStatus = getImporterStatus( steps?.content?.status, steps.subscribers.status );

	// Either content- or subscriber-import is still in progress
	if ( importerStatus === 'importing' || importerStatus === 'initial' ) {
		return (
			<Card>
				<h2>{ __( 'Almost there…' ) }</h2>
				<div className="summary__content">
					<p>
						<strong>
							{ getSummaryDescription( steps?.content?.status, steps.subscribers.status ) }
						</strong>
						<br />
					</p>
				</div>
				<p>
					{ __(
						"This may take a few minutes. Feel free to leave this window – we'll let you know when it's done."
					) }
				</p>
				<p>
					<ProgressBar className="is-larger-progress-bar" />
				</p>
			</Card>
		);
	}

	// Skipped both steps...
	if ( importerStatus === 'skipped' ) {
		return (
			<Card>
				<h2>{ __( 'Summary' ) }</h2>
				<div className="summary__content summary__content-skipped">
					{ steps?.content?.content && (
						<ContentSummary stepContent={ steps.content.content } status={ steps.content.status } />
					) }
					{ steps.subscribers.content && (
						<SubscribersSummary
							stepContent={ steps.subscribers.content }
							status={ steps.subscribers.status }
						/>
					) }
				</div>
				<ImporterActionButtonContainer noSpacing>
					<ImporterActionButton
						href={ `/import/newsletter/substack/${
							selectedSite.slug
						}/${ 'content' }?from=${ fromSite }` }
						onClick={ resetImporter }
						primary
					>
						{ __( 'Start over' ) }
					</ImporterActionButton>
				</ImporterActionButtonContainer>
			</Card>
		);
	}

	// Both done!
	if ( importerStatus === 'done' ) {
		return (
			<Card>
				{ showConfetti && <ConfettiAnimation trigger={ ! prefersReducedMotion } /> }
				<h2>{ __( 'Success!' ) } 🎉</h2>

				<p>
					{ sprintf(
						// translators: %s the site name
						__( 'Here’s a summary of the imported data to %s:' ),
						selectedSite.name
					) }
				</p>
				<div className="summary__content">
					{ steps?.content?.content && (
						<ContentSummary stepContent={ steps.content.content } status={ steps.content.status } />
					) }
					{ steps.subscribers.content && (
						<SubscribersSummary
							stepContent={ steps.subscribers.content }
							status={ steps.subscribers.status }
						/>
					) }
				</div>
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
				<hr />
				<p>{ __( 'What would you like to do next?' ) }</p>
				<ImporterActionButtonContainer noSpacing>
					{ isJetpack ? (
						<ImporterActionButton
							href={ `${ siteAdmminUrl }admin.php?page=jetpack#/newsletter` }
							primary
						>
							{ __( 'Customize your newsletter' ) }
						</ImporterActionButton>
					) : (
						<ImporterActionButton
							href={ `/settings/newsletter/${ selectedSite.slug }` }
							onClick={ resetImporter }
							primary
						>
							{ __( 'Customize your newsletter' ) }
						</ImporterActionButton>
					) }
					{ steps?.content && (
						<ImporterActionButton href={ '/posts/' + selectedSite.slug } onClick={ resetImporter }>
							{ __( 'View content' ) }
						</ImporterActionButton>
					) }
					{ isJetpack ? (
						<ImporterActionButton
							href={ `https://cloud.jetpack.com/subscribers/${ selectedSite.slug }` }
						>
							{ __( 'Check subscribers' ) }
						</ImporterActionButton>
					) : (
						<ImporterActionButton
							href={ `/subscribers/${ selectedSite.slug }` }
							onClick={ resetImporter }
						>
							{ __( 'Check subscribers' ) }
						</ImporterActionButton>
					) }
				</ImporterActionButtonContainer>
			</Card>
		);
	}
}
