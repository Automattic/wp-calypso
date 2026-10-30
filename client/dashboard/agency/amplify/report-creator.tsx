import { startAmplifyReportMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	BaseControl,
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useId, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { Card, CardBody } from '../../components/card';
import Grid from '../../components/grid';
import { Text } from '../../components/text';
import { getReportTiming } from './constants';
import AmplifyOverviewStory from './overview-story';
import { WebsiteAddressPicker, getStartErrorMessage } from './scan-form';
import AmplifyScorePreview from './score-preview';
import { normalizeAmplifyUrl } from './url';
import { AmplifyLimitReached, AmplifyScansLeft } from './usage-meter';
import type { SiteOption } from './scan-form';
import type { AmplifyUsageStatus } from './usage';
import type { AgencyTierId, AmplifyMode, AmplifyUsage } from '@automattic/api-core';

const REPORT_MODES: {
	value: AmplifyMode;
	label: string;
	description: string;
}[] = [
	{
		value: 'full',
		label: __( 'Full report' ),
		description: __( 'People and AI agents, the complete picture for your pitch.' ),
	},
	{
		value: 'human',
		label: __( 'People' ),
		description: __( 'Trust, clarity, and what builds confidence.' ),
	},
	{
		value: 'ai',
		label: __( 'AI agents' ),
		description: __( 'How ChatGPT, Perplexity, and others read and rank the site.' ),
	},
];

/**
 * A radio button's circle, drawn for a card that acts as the radio. Sized to the
 * 20px label line so it sits level with the option name.
 */
function RadioIndicator( { isSelected }: { isSelected: boolean } ) {
	return (
		<svg width={ 16 } height={ 20 } viewBox="0 -2 16 20" aria-hidden="true" focusable="false">
			{ isSelected ? (
				<>
					<circle cx={ 8 } cy={ 8 } r={ 8 } fill="var( --color-primary )" />
					<circle cx={ 8 } cy={ 8 } r={ 5 } fill="var( --color-surface )" />
				</>
			) : (
				<circle
					cx={ 8 }
					cy={ 8 }
					r={ 7.25 }
					fill="var( --color-surface )"
					stroke="var( --color-text )"
					strokeWidth={ 1.5 }
				/>
			) }
		</svg>
	);
}

/** The report types as selectable cards, one per column. */
function ReportTypeCards( {
	selected,
	isSingleColumn,
	onSelect,
}: {
	selected: AmplifyMode;
	isSingleColumn: boolean;
	onSelect: ( mode: AmplifyMode ) => void;
} ) {
	const labelId = useId();
	const isWide = useViewportMatch( 'large' );
	return (
		<VStack className="dashboard-amplify-overview__mode-options" spacing={ 2 }>
			<BaseControl.VisualLabel id={ labelId }>{ __( 'Report type' ) }</BaseControl.VisualLabel>
			<Grid
				role="radiogroup"
				aria-labelledby={ labelId }
				columns={ isSingleColumn || ! isWide ? 1 : REPORT_MODES.length }
				gap="sm"
			>
				{ REPORT_MODES.map( ( option ) => {
					const isSelected = option.value === selected;
					return (
						<Card
							key={ option.value }
							role="radio"
							aria-checked={ isSelected }
							tabIndex={ 0 }
							onClick={ () => onSelect( option.value ) }
							onKeyDown={ ( event: React.KeyboardEvent ) => {
								if ( event.key === 'Enter' || event.key === ' ' ) {
									event.preventDefault();
									onSelect( option.value );
								}
							} }
							style={ {
								cursor: 'pointer',
								boxShadow: isSelected ? 'inset 0 0 0 2px var( --color-primary )' : undefined,
							} }
						>
							<CardBody
								size={ {
									blockStart: 'xSmall',
									blockEnd: 'xSmall',
									inlineStart: 'small',
									inlineEnd: 'small',
								} }
							>
								<HStack spacing={ 3 } alignment="flex-start" justify="flex-start">
									<RadioIndicator isSelected={ isSelected } />
									<VStack spacing={ 1 }>
										<Text size={ 13 } lineHeight="20px" weight={ 600 }>
											{ option.label }
										</Text>
										<Text size={ 12 } variant="muted">
											{ option.description }
										</Text>
									</VStack>
								</HStack>
							</CardBody>
						</Card>
					);
				} ) }
			</Grid>
		</VStack>
	);
}

export function AmplifyOverviewIntro( { mode }: { mode: AmplifyMode } ) {
	return (
		<>
			<div className="dashboard-amplify-overview__hero-preview">
				<AmplifyScorePreview mode={ mode } />
			</div>
			<div className="dashboard-amplify-overview__intro">
				<Heading id="dashboard-amplify-title" level={ 2 }>
					{ __( 'Turn a prospect’s homepage into your next winning pitch' ) }
				</Heading>
				<div className="dashboard-amplify-overview__summary">
					<Text>
						{ __(
							'Visitors leave when their questions go unanswered, and AI agents skip sites they can’t read. Get a report on both, and pitch prospects with evidence.'
						) }
					</Text>
				</div>
			</div>
		</>
	);
}

export default function AmplifyReportCreator( {
	agencyId,
	canScan = true,
	usage,
	usageStatus = 'unknown',
	tierId,
	initialUrl = '',
	initialMode = 'full',
	isModal = false,
	onCreated,
	onUsageError,
}: {
	agencyId: number;
	/** False at the monthly cap, while awaiting review, or when not approved. */
	canScan?: boolean;
	usage?: AmplifyUsage;
	usageStatus?: AmplifyUsageStatus;
	tierId?: AgencyTierId;
	initialUrl?: string;
	initialMode?: AmplifyMode;
	isModal?: boolean;
	onCreated?: () => void;
	/** Called when the API rejects an audit for usage reasons, so the page can refresh usage. */
	onUsageError?: ( code: string ) => void;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice } = useDispatch( noticesStore );
	const start = useMutation( startAmplifyReportMutation( agencyId ) );
	const [ urlInput, setUrlInput ] = useState( initialUrl );
	const [ urlError, setUrlError ] = useState( '' );
	const [ selectedSite, setSelectedSite ] = useState< string | null >( null );
	const [ mode, setMode ] = useState< AmplifyMode >( initialMode );
	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( start.isPending ) {
			return;
		}
		const url = selectedSite ?? normalizeAmplifyUrl( urlInput );
		if ( ! url ) {
			setUrlError( __( 'Enter a valid public website URL.' ) );
			return;
		}
		if ( ! canScan ) {
			return;
		}
		setUrlError( '' );
		if ( ! isModal ) {
			recordTracksEvent( 'calypso_a4a_amplify_empty_state_url_continue', { mode } );
		}
		recordTracksEvent( 'calypso_a4a_amplify_start_analysis_click', { mode } );
		start.mutate(
			{ url, mode },
			{
				onSuccess: () => {
					createSuccessNotice(
						sprintf(
							/* translators: %s: how long a report takes, e.g. "10 to 20 minutes" */
							__( 'Report started. It will be ready in %s.' ),
							getReportTiming()
						),
						{ type: 'snackbar' }
					);
					onCreated?.();
				},
				onError: ( error ) => {
					const code = ( error as { code?: string } )?.code;
					if (
						code === 'amplify_report_limit_reached' ||
						code === 'amplify_report_rate_limited' ||
						code === 'amplify_account_not_activated'
					) {
						onUsageError?.( code );
					}
					setUrlError( getStartErrorMessage( error ) );
				},
			}
		);
	};

	return (
		<section
			className="dashboard-amplify-overview"
			data-context={ isModal ? 'modal' : 'empty' }
			aria-labelledby={ isModal ? undefined : 'dashboard-amplify-title' }
		>
			{ ! isModal && <AmplifyOverviewIntro mode={ mode } /> }
			{ isModal && (
				<div className="dashboard-amplify-overview__modal-summary">
					<Text>
						{ __(
							'Audit any public homepage for people, AI agents, or both, and get a report of what to fix for your pitch.'
						) }
					</Text>
				</div>
			) }
			{ usageStatus === 'cap' ? (
				<AmplifyLimitReached agencyId={ agencyId } usage={ usage } tierId={ tierId } />
			) : (
				<>
					<form className="dashboard-amplify-overview__url-form" onSubmit={ handleSubmit }>
						<div className="dashboard-amplify-overview__url-row">
							<WebsiteAddressPicker
								agencyId={ agencyId }
								label={ __( 'Homepage URL' ) }
								placeholder={ __( 'Paste a prospect’s URL or pick a client site' ) }
								idPrefix="amplify-report-connected-site"
								value={ urlInput }
								selectedSite={ selectedSite }
								onChange={ ( value ) => {
									setUrlInput( value );
									setSelectedSite( null );
									setUrlError( '' );
								} }
								onClear={ () => {
									setUrlInput( '' );
									setSelectedSite( null );
									setUrlError( '' );
								} }
								onSelectSite={ ( site: SiteOption ) => {
									setUrlInput( site.hostname );
									setSelectedSite( site.url );
									setUrlError( '' );
								} }
								invalid={ !! urlError }
								portalSuggestions={ isModal }
							/>
							<Button
								__next40pxDefaultSize
								type="submit"
								variant="primary"
								isBusy={ start.isPending }
								disabled={ start.isPending || ! agencyId || ! canScan }
								accessibleWhenDisabled
							>
								{ __( 'Create report' ) }
							</Button>
						</div>
						{ urlError && (
							<p className="dashboard-amplify-overview__url-error" role="alert">
								{ urlError }
							</p>
						) }
						<AmplifyScansLeft
							agencyId={ agencyId }
							usage={ usage }
							status={ usageStatus }
							tierId={ tierId }
						/>
					</form>
					<ReportTypeCards
						selected={ mode }
						isSingleColumn={ isModal }
						onSelect={ ( nextMode ) => {
							setMode( nextMode );
							recordTracksEvent( 'calypso_a4a_amplify_report_type_select', {
								mode: nextMode,
							} );
						} }
					/>
				</>
			) }
			{ ! isModal && <AmplifyOverviewStory /> }
		</section>
	);
}
