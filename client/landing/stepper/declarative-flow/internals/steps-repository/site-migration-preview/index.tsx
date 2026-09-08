import { SWITCH_RUN_PREVIEW_TERMINAL_STATES } from '@automattic/api-core';
import { switchRunPreviewQuery } from '@automattic/api-queries';
import { Badge, SiteThumbnail, Spinner } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { Step } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { convertPlatformName } from 'calypso/blocks/import/util';
import DocumentHead from 'calypso/components/data/document-head';
import { getMigrationWizardSteps } from '../../../flows/site-migration-flow/wizard-steps';
import { useFlowState } from '../../state-manager/store';
import { MigrationWizardProgress } from '../components/migration-wizard-progress';
import { useSitePreviewMShotImageHandler } from '../site-migration-instructions/site-preview/hooks/use-site-preview-mshot-image-handler';
import type { Step as StepType } from '../../types';
import type { SwitchRunPreviewMatch } from '@automattic/api-core';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

import './style.scss';

const SLUG = 'site-migration-preview';
const POLL_INTERVAL = 5000;
const WHITE_GLOVE_PRICE = 149;

type PreviewTarget = 'source' | 'destination';
type PreviewDevice = 'desktop' | 'mobile';

const DEVICE_MSHOT_OPTIONS = {
	desktop: { vpw: 1600, vph: 1600, w: 1200, h: 900, screen_height: 1600 },
	mobile: { vpw: 479, vph: 1200, w: 479, h: 850, screen_height: 1200 },
} as const;

const SiteMigrationPreview: StepType< { submits: { action: 'continue' | 'white-glove' } } > =
	function SiteMigrationPreview( { navigation } ) {
		const { __ } = useI18n();
		const { get } = useFlowState();
		const [ searchParams, setSearchParams ] = useSearchParams();

		const identify = get( 'site-migration-identify' );
		const platformName = convertPlatformName(
			( searchParams.get( 'platform' ) ?? identify?.platform ?? 'unknown' ) as ImporterPlatform
		);

		// The run is carried by the URL so a refresh mid-build resumes the same preview; flow
		// state is the fallback for entries that arrive without the query param.
		const runId = searchParams.get( 'switchRunId' ) ?? get( 'site-migration-scan' )?.runId ?? null;

		useEffect( () => {
			if ( ! runId || searchParams.get( 'switchRunId' ) === runId ) {
				return;
			}

			const nextParams = new URLSearchParams( searchParams );
			nextParams.set( 'switchRunId', runId );
			setSearchParams( nextParams, { replace: true } );
		}, [ runId, searchParams, setSearchParams ] );

		const { data: preview } = useQuery( {
			...switchRunPreviewQuery( runId ?? '' ),
			enabled: Boolean( runId ),
			refetchInterval: ( query ) => {
				const state = query.state.data?.state;
				return state && SWITCH_RUN_PREVIEW_TERMINAL_STATES.includes( state )
					? false
					: POLL_INTERVAL;
			},
		} );

		const [ target, setTarget ] = useState< PreviewTarget >( 'destination' );
		const [ device, setDevice ] = useState< PreviewDevice >( 'desktop' );

		const sourceUrl =
			preview?.source_url ?? searchParams.get( 'from' ) ?? identify?.from ?? undefined;
		const destinationUrl = preview?.preview_url;
		const visibleUrl = target === 'source' ? sourceUrl : destinationUrl;

		// Warm every responsive size up front: mShots is slow to generate, and the device toggle
		// would otherwise stall the first time each size is asked for.
		const { createScreenshots } = useSitePreviewMShotImageHandler();
		const warmed = useRef< Set< string > >( new Set() );
		useEffect( () => {
			[ sourceUrl, destinationUrl ].forEach( ( url ) => {
				if ( ! url || warmed.current.has( url ) ) {
					return;
				}
				warmed.current.add( url );
				createScreenshots( url );
			} );
		}, [ createScreenshots, destinationUrl, sourceUrl ] );

		const isBuilding = ! preview || preview.state === 'building';
		const hasFailed = preview?.state === 'failed';

		const matchBadges = preview?.match ? buildMatchBadges( preview.match, __ ) : [];

		return (
			<>
				<DocumentHead title={ __( 'Your site on WordPress.com' ) } />
				<Step.CenteredColumnLayout
					className="step-container-v2--site-migration-preview"
					columnWidth={ 10 }
					topBar={
						<Step.TopBar
							centerElement={
								<MigrationWizardProgress steps={ getMigrationWizardSteps() } current={ SLUG } />
							}
						/>
					}
					heading={
						<Step.Heading
							text={ __( 'Here’s your site on WordPress.com' ) }
							subText={ __( 'Nothing goes live until you hit Migrate.' ) }
						/>
					}
					stickyBottomBar={ () => (
						<Step.StickyBottomBar
							leftElement={
								navigation.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : null
							}
							rightElement={
								<Step.PrimaryButton onClick={ () => navigation.submit?.( { action: 'continue' } ) }>
									{ __( 'This looks right — continue' ) }
								</Step.PrimaryButton>
							}
						/>
					) }
				>
					<VStack spacing={ 6 }>
						<HStack className="site-migration-preview__toggles" justify="space-between" wrap>
							<ToggleGroupControl
								className="site-migration-preview__target-toggle"
								label={ __( 'Preview' ) }
								hideLabelFromVision
								isBlock
								value={ target }
								onChange={ ( value ) => setTarget( value as PreviewTarget ) }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							>
								<ToggleGroupControlOption
									value="source"
									label={ sprintf(
										/* translators: %s: name of the platform the site is moving from, e.g. “Wix”. */
										__( 'Your %s site' ),
										platformName
									) }
								/>
								<ToggleGroupControlOption value="destination" label={ __( 'On WordPress.com' ) } />
							</ToggleGroupControl>

							<ToggleGroupControl
								className="site-migration-preview__device-toggle"
								label={ __( 'Device' ) }
								hideLabelFromVision
								isBlock
								value={ device }
								onChange={ ( value ) => setDevice( value as PreviewDevice ) }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							>
								<ToggleGroupControlOption value="desktop" label={ __( 'Desktop' ) } />
								<ToggleGroupControlOption value="mobile" label={ __( 'Mobile' ) } />
							</ToggleGroupControl>
						</HStack>

						<div
							className={ `site-migration-preview__frame is-${ device }` }
							data-preview-target={ target }
						>
							{ isBuilding && (
								<div className="site-migration-preview__status" role="status">
									<Spinner size={ 20 } />
									{ __( 'Building your preview…' ) }
								</div>
							) }
							{ hasFailed && (
								<p className="site-migration-preview__status" role="status">
									{ __(
										'We couldn’t build a preview this time. Your migration can still go ahead.'
									) }
								</p>
							) }
							{ ! isBuilding && ! hasFailed && visibleUrl && (
								<SiteThumbnail
									key={ `${ target }-${ device }` }
									className="site-migration-preview__screenshot"
									mShotsUrl={ visibleUrl }
									mshotsOption={ DEVICE_MSHOT_OPTIONS[ device ] }
									width={ DEVICE_MSHOT_OPTIONS[ device ].w }
									height={ DEVICE_MSHOT_OPTIONS[ device ].h }
									alt={
										target === 'source'
											? sprintf(
													/* translators: %s: name of the platform the site is moving from, e.g. “Wix”. */
													__( 'Preview of your %s site' ),
													platformName
											  )
											: __( 'Preview of your site on WordPress.com' )
									}
								>
									<Spinner size={ 40 } />
								</SiteThumbnail>
							) }
						</div>

						<p className="site-migration-preview__caption">
							{ target === 'source'
								? sprintf(
										/* translators: %s: name of the platform the site is moving from, e.g. “Wix”. */
										__( 'Showing your %s site' ),
										platformName
								  )
								: __( 'Showing your site on WordPress.com' ) }
						</p>

						{ matchBadges.length > 0 && (
							<HStack className="site-migration-preview__match" justify="flex-start" wrap>
								{ matchBadges.map( ( badge ) => (
									<Badge key={ badge.key } type={ badge.isComplete ? 'success' : 'warning' }>
										{ badge.label }
									</Badge>
								) ) }
							</HStack>
						) }

						<Card className="site-migration-preview__white-glove" size="large">
							<CardBody>
								<VStack spacing={ 3 }>
									<h2 className="site-migration-preview__white-glove-title">
										{ __( 'Prefer we handle it for you?' ) }
									</h2>
									<p className="site-migration-preview__white-glove-copy">
										{ sprintf(
											/* translators: %s: formatted one-off price, e.g. “$149”. */
											__(
												'Our migration team will move everything across and check it over for %s. Done in 2 business days.'
											),
											formatCurrency( WHITE_GLOVE_PRICE, 'USD', { stripZeros: true } )
										) }
									</p>
									<div>
										<Button
											variant="secondary"
											__next40pxDefaultSize
											onClick={ () => navigation.submit?.( { action: 'white-glove' } ) }
										>
											{ __( 'Get a white-glove migration' ) }
										</Button>
									</div>
								</VStack>
							</CardBody>
						</Card>
					</VStack>
				</Step.CenteredColumnLayout>
			</>
		);
	};

function buildMatchBadges(
	match: SwitchRunPreviewMatch,
	__: ReturnType< typeof useI18n >[ '__' ]
): { key: string; label: string; isComplete: boolean }[] {
	return [
		{
			key: 'layout',
			label: match.layout ? __( 'Layout matches' ) : __( 'Layout differs' ),
			isComplete: match.layout,
		},
		{
			key: 'fonts',
			label: match.fonts ? __( 'Fonts matched' ) : __( 'Fonts substituted' ),
			isComplete: match.fonts,
		},
		{
			key: 'images',
			label: sprintf(
				/* translators: 1: number of images brought over. 2: total number of images found. */
				__( '%1$d of %2$d images' ),
				match.images.matched,
				match.images.total
			),
			isComplete: match.images.matched === match.images.total,
		},
		{
			key: 'pages',
			label: sprintf(
				/* translators: 1: number of pages brought over. 2: total number of pages found. */
				__( '%1$d of %2$d pages' ),
				match.pages.matched,
				match.pages.total
			),
			isComplete: match.pages.matched === match.pages.total,
		},
	];
}

export default SiteMigrationPreview;
