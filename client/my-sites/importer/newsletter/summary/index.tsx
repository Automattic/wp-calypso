import page from '@automattic/calypso-router';
import { Card, ConfettiAnimation } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { ProgressBar, ExternalLink, Notice } from '@wordpress/components';
import { useReducedMotion } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { fixMe, translate } from 'i18n-calypso';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import pauseSubstackBillingImg from 'calypso/assets/images/importer/pause-substack-billing.png';
import { Steps, StepStatus } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { useSelector } from 'calypso/state';
import { isJetpackSite, getSiteAdminUrl } from 'calypso/state/sites/selectors';
import ImporterActionButton from '../../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../../importer-action-buttons/container';
import { getImporterStatus, normalizeFromSite } from '../utils';
import ContentSummary from './content';
import SubscribersSummary from './subscribers';

interface SummaryProps {
	selectedSite: SiteDetails;
	steps: Steps;
	resetImporter: () => void;
	fromSite: string;
	onResetImporter?: () => void;
	onImportExpired: () => void;
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
	resetImporter,
	fromSite,
	showConfetti,
	onResetImporter = () => {},
	shouldShownConfetti,
}: SummaryProps ) {
	const { __ } = useI18n();
	const prefersReducedMotion = useReducedMotion();
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite.ID ) );
	const siteAdmminUrl = useSelector( ( state ) => getSiteAdminUrl( state, selectedSite.ID ) );
	const [ isImportCompleted, setIsImportCompleted ] = useState( false );
	const [ importStepsResults, setImportStepsResults ] = useState< Steps | null >();
	const importerStatus = getImporterStatus( steps );

	const paidSubscribersCount = parseInt(
		steps.subscribers.content?.meta?.paid_subscribed_count || '0'
	);
	const showPauseSubstackBillingWarning = paidSubscribersCount > 0;

	useEffect( () => {
		if ( showConfetti ) {
			shouldShownConfetti( false );
		}
	}, [ showConfetti, shouldShownConfetti ] );

	/**
	 * We have a state to manage the Summary page after we reset the importer.
	 * Otherwise when we reset the importer we lose the returned data.
	 */
	useEffect( () => {
		if ( ! isImportCompleted && ( importerStatus === 'done' || importerStatus === 'skipped' ) ) {
			setIsImportCompleted( true );

			if ( ! importStepsResults && steps ) {
				setImportStepsResults( steps );
			}

			// Reset the importer if it's completed and the Summary page is exited.
			page.exit( '/import/newsletter/substack/:site?/summary', ( context, next ) => {
				resetImporter();
				next();
			} );
		}
	}, [ importerStatus, importStepsResults, isImportCompleted, steps, resetImporter ] );

	// Either content- or subscriber-import is still in progress
	if ( importerStatus === 'importing' ) {
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
					<ImporterActionButton onClick={ onResetImporter } primary>
						{ __( 'Start over' ) }
					</ImporterActionButton>
				</ImporterActionButtonContainer>
			</Card>
		);
	}

	// Both done!
	if ( isImportCompleted ) {
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
					{ importStepsResults?.content?.content && (
						<ContentSummary stepContent={ importStepsResults.content.content } status="done" />
					) }
					{ importStepsResults?.subscribers?.content && (
						<SubscribersSummary
							stepContent={ importStepsResults?.subscribers?.content }
							status={ importStepsResults.subscribers.status }
						/>
					) }
				</div>
				{ showPauseSubstackBillingWarning && (
					<Notice status="warning" className="importer__notice" isDismissible={ false }>
						<h2>{ __( 'Action required' ) }</h2>
						{ fixMe( {
							text: 'To prevent double-charging your subscribers, go to your {{substackPaymentsSettingsLink}}Substack Payments Settings{{/substackPaymentsSettingsLink}} and under "Pause subscription billing," click {{strong}}Pause{{/strong}}.',
							newCopy: translate(
								'To prevent double-charging your subscribers, go to your {{substackPaymentsSettingsLink}}Substack Payments Settings{{/substackPaymentsSettingsLink}} and under "Pause subscription billing," click {{strong}}Pause{{/strong}}.',
								{
									components: {
										strong: <strong />,
										substackPaymentsSettingsLink: (
											// @ts-expect-error Used in translate components doesn't need children.
											<ExternalLink
												href={ `${ normalizeFromSite(
													fromSite
												) }/publish/settings?search=Pause%20subscription` }
											/>
										),
									},
								}
							),
							oldCopy: translate(
								'To prevent any charges from Substack, go to your {{substackPaymentsSettingsLink}}Substack Payments Settings{{/substackPaymentsSettingsLink}}, select "Pause billing" and click "{{strong}}Pause indefinitely{{/strong}}".',
								{
									components: {
										strong: <strong />,
										substackPaymentsSettingsLink: (
											// @ts-expect-error Used in translate components doesn't need children.
											<ExternalLink
												href={ `${ normalizeFromSite(
													fromSite
												) }/publish/settings?search=Pause%20subscription` }
											/>
										),
									},
								}
							),
						} ) }
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
					<ImporterActionButton
						href={
							isJetpack
								? `${ siteAdmminUrl }admin.php?page=jetpack#/newsletter`
								: `/settings/newsletter/${ selectedSite.slug }`
						}
						primary
					>
						{ __( 'Customize your newsletter' ) }
					</ImporterActionButton>
					{ steps?.content && (
						<ImporterActionButton href={ `${ selectedSite.URL }/wp-admin/edit.php` }>
							{ __( 'View content' ) }
						</ImporterActionButton>
					) }
					<ImporterActionButton
						href={
							isJetpack
								? `https://cloud.jetpack.com/subscribers/${ selectedSite.slug }`
								: `/subscribers/${ selectedSite.slug }`
						}
					>
						{ __( 'Manage subscribers' ) }
					</ImporterActionButton>
				</ImporterActionButtonContainer>
			</Card>
		);
	}
}
