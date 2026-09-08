import { SWITCH_RUN_ANALYSIS_SETTLED_STATES } from '@automattic/api-core';
import { createSwitchRunMutation, switchRunQuery } from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	ProgressBar,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Icon, check, info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { getMigrationWizardSteps } from '../../../flows/site-migration-flow/wizard-steps';
import { useFlowState } from '../../state-manager/store';
import { MigrationWizardProgress } from '../components/migration-wizard-progress';
import type { Step as StepType } from '../../types';
import type { SwitchRunAnalysis } from '@automattic/api-core';

import './style.scss';

const SLUG = 'site-migration-scan';
const POLL_INTERVAL = 5000;

export type SiteMigrationScanSubmits = {
	action: 'continue' | 'failed';
	runId?: string;
	analysis?: SwitchRunAnalysis;
};

const SiteMigrationScan: StepType< { submits: SiteMigrationScanSubmits } > =
	function SiteMigrationScan( { navigation } ) {
		const { __ } = useI18n();
		const { get, set } = useFlowState();
		const [ searchParams, setSearchParams ] = useSearchParams();

		const sourceUrl = searchParams.get( 'from' ) ?? get( 'site-migration-identify' )?.from ?? '';

		// A run already in the URL or in flow state is resumed rather than re-created, so a
		// refresh mid-poll picks the analysis back up where it left off.
		const [ runId, setRunId ] = useState< string | null >(
			() => searchParams.get( 'switchRunId' ) ?? get( SLUG )?.runId ?? null
		);

		const { mutate: createRun, isError: hasCreateFailed } = useMutation(
			createSwitchRunMutation()
		);
		const hasRequestedRun = useRef( false );

		useEffect( () => {
			if ( runId || ! sourceUrl || hasRequestedRun.current ) {
				return;
			}

			hasRequestedRun.current = true;
			createRun( sourceUrl, { onSuccess: ( run ) => setRunId( run.run_id ) } );
		}, [ createRun, runId, sourceUrl ] );

		const { data: run, isError: hasPollFailed } = useQuery( {
			...switchRunQuery( runId ?? '' ),
			enabled: Boolean( runId ),
			refetchInterval: ( query ) => {
				const state = query.state.data?.state;
				return state && SWITCH_RUN_ANALYSIS_SETTLED_STATES.includes( state )
					? false
					: POLL_INTERVAL;
			},
		} );

		const analysis = run?.analysis;
		const hasFailed =
			! sourceUrl ||
			hasCreateFailed ||
			hasPollFailed ||
			run?.state === 'failed' ||
			run?.state === 'expired';

		useEffect( () => {
			if ( ! runId || searchParams.get( 'switchRunId' ) === runId ) {
				return;
			}

			const nextParams = new URLSearchParams( searchParams );
			nextParams.set( 'switchRunId', runId );
			setSearchParams( nextParams, { replace: true } );
		}, [ runId, searchParams, setSearchParams ] );

		// Mirrored into flow state so the SEO and Review steps can read `analysis.counts`, and so
		// a resumed session finds the run without asking the API for it again.
		const lastPersisted = useRef( '' );
		useEffect( () => {
			if ( ! runId ) {
				return;
			}

			const payload: SiteMigrationScanSubmits = {
				action: hasFailed ? 'failed' : 'continue',
				runId,
				analysis,
			};
			const signature = JSON.stringify( payload );

			if ( lastPersisted.current === signature ) {
				return;
			}

			lastPersisted.current = signature;
			set( SLUG, payload );
		}, [ analysis, hasFailed, runId, set ] );

		const hasReportedFailure = useRef( false );
		useEffect( () => {
			if ( ! hasFailed || hasReportedFailure.current ) {
				return;
			}

			hasReportedFailure.current = true;
			navigation.submit?.( { action: 'failed', runId: runId ?? undefined } );
		}, [ hasFailed, navigation, runId ] );

		const scanningStatus =
			run?.state === 'analyzing'
				? __( 'Reading your pages, posts, and images…' )
				: __( 'Getting in line to read your site…' );

		return (
			<>
				<DocumentHead title={ __( 'Reading your site' ) } />
				<Step.CenteredColumnLayout
					className="step-container-v2--site-migration-scan"
					columnWidth={ 8 }
					topBar={
						<Step.TopBar
							centerElement={
								<MigrationWizardProgress steps={ getMigrationWizardSteps() } current={ SLUG } />
							}
						/>
					}
					heading={
						<Step.Heading
							text={ __( 'Reading your site' ) }
							subText={
								analysis
									? __( 'Nothing on your current site changes — we only take a copy.' )
									: __( 'Hang tight while we take a look at what you have.' )
							}
						/>
					}
					stickyBottomBar={ () => (
						<Step.StickyBottomBar
							leftElement={
								navigation.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : null
							}
							rightElement={
								analysis ? (
									<Step.PrimaryButton
										onClick={ () =>
											navigation.submit?.( {
												action: 'continue',
												runId: runId ?? undefined,
												analysis,
											} )
										}
									>
										{ __( 'Looks right — continue' ) }
									</Step.PrimaryButton>
								) : null
							}
						/>
					) }
				>
					<Card className="site-migration-scan__card" size="large">
						<CardBody>
							{ analysis ? (
								<VStack spacing={ 6 }>
									<HStack
										className="site-migration-scan__site"
										justify="flex-start"
										spacing={ 3 }
										alignment="center"
									>
										{ analysis.site.favicon && (
											<img
												className="site-migration-scan__favicon"
												src={ analysis.site.favicon }
												alt=""
												width={ 32 }
												height={ 32 }
											/>
										) }
										<VStack spacing={ 0 }>
											<span className="site-migration-scan__site-title">
												{ analysis.site.title }
											</span>
											<span className="site-migration-scan__site-host">{ analysis.site.host }</span>
										</VStack>
									</HStack>

									<ul className="site-migration-scan__findings">
										{ analysis.findings.map( ( finding ) => (
											<li
												key={ finding.key }
												className={ clsx( 'site-migration-scan__finding', {
													'is-missing': ! finding.ok,
												} ) }
											>
												<span
													className="site-migration-scan__finding-status"
													role="img"
													aria-label={ finding.ok ? __( 'Found' ) : __( 'Not captured' ) }
												>
													<Icon icon={ finding.ok ? check : info } size={ 20 } />
												</span>
												<span className="site-migration-scan__finding-label">
													{ finding.label }
												</span>
												<span className="site-migration-scan__finding-detail">
													{ finding.detail }
												</span>
											</li>
										) ) }
									</ul>

									<p
										className={ clsx(
											'site-migration-scan__verdict',
											`is-${ analysis.verdict.level }`
										) }
									>
										{ analysis.verdict.text }
									</p>
								</VStack>
							) : (
								<VStack spacing={ 4 }>
									<p className="site-migration-scan__status" role="status">
										{ scanningStatus }
									</p>
									<ProgressBar className="site-migration-scan__progress" />
								</VStack>
							) }
						</CardBody>
					</Card>
				</Step.CenteredColumnLayout>
			</>
		);
	};

export default SiteMigrationScan;
