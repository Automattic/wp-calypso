import { startAmplifyReportMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { RadioControl, Spinner, __experimentalHeading as Heading } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { Text } from '../../components/text';
import { getReportTiming } from './constants';
import AmplifyOverviewStory from './overview-story';
import { WebsiteAddressPicker, getStartErrorMessage } from './scan-form';
import AmplifyScorePreview from './score-preview';
import { normalizeAmplifyUrl } from './url';
import { AmplifyScansLeft } from './usage-meter';
import type { SiteOption } from './scan-form';
import type { AmplifyUsageStatus } from './usage';
import type { AmplifyMode, AmplifyUsage } from '@automattic/api-core';

const REPORT_MODES: {
	value: AmplifyMode;
	label: string;
	description: string;
}[] = [
	{
		value: 'full',
		label: __( 'Full' ),
		description: __( 'The complete picture for your pitch.' ),
	},
	{
		value: 'human',
		label: __( 'First-time visitors' ),
		description: __( 'Trust, clarity, and what builds confidence.' ),
	},
	{
		value: 'ai',
		label: __( 'AI agents' ),
		description: __( 'How ChatGPT, Perplexity, and others read and rank the site.' ),
	},
];

export function AmplifyOverviewIntro( {
	mode,
	heroTitle,
}: {
	mode: AmplifyMode;
	heroTitle?: string;
} ) {
	return (
		<>
			<div className="dashboard-amplify-overview__hero-preview">
				{ heroTitle && (
					<Heading className="dashboard-amplify-overview__hero-title" level={ 1 }>
						{ heroTitle }
					</Heading>
				) }
				<AmplifyScorePreview mode={ mode } />
			</div>
			<div className="dashboard-amplify-overview__intro">
				<Heading id="dashboard-amplify-title" level={ 2 }>
					{ __( 'Turn a prospect’s homepage into your next winning pitch' ) }
				</Heading>
				<div className="dashboard-amplify-overview__summary">
					<Text>
						{ __(
							'Website visitors leave when their questions go unanswered, and AI agents skip sites they can’t parse. Our audit covers both audiences and gives you a report of what to fix, so you can approach prospective clients with a pitch built on evidence.'
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
	limitNotice,
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
	/** Awaiting review, not approved, or cap notice, shown above the form. */
	limitNotice?: React.ReactNode;
	initialUrl?: string;
	initialMode?: AmplifyMode;
	isModal?: boolean;
	onCreated: () => void;
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
							__( 'Audit started. Your report will be ready in %s.' ),
							getReportTiming()
						),
						{ type: 'snackbar' }
					);
					onCreated();
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
							'Audit any public homepage for first-time visitors, AI agents, or both, and get a report of what to fix for your pitch.'
						) }
					</Text>
				</div>
			) }
			{ limitNotice && <div className="dashboard-amplify-overview__limit">{ limitNotice }</div> }
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
					<button
						type="submit"
						className="components-button is-primary dashboard-amplify-overview__submit"
						aria-busy={ start.isPending }
						disabled={ start.isPending || ! agencyId || ! canScan }
					>
						{ start.isPending ? <Spinner /> : __( 'Create report' ) }
					</button>
				</div>
				{ urlError && (
					<p className="dashboard-amplify-overview__url-error" role="alert">
						{ urlError }
					</p>
				) }
				<AmplifyScansLeft usage={ usage } status={ usageStatus } />
			</form>
			<RadioControl
				className="dashboard-amplify-overview__mode-options"
				label={ __( 'Report type' ) }
				selected={ mode }
				options={ REPORT_MODES }
				onChange={ ( selectedMode ) => {
					const nextMode = selectedMode as AmplifyMode;
					setMode( nextMode );
					recordTracksEvent( 'calypso_a4a_amplify_report_type_select', {
						mode: nextMode,
					} );
				} }
			/>
			{ ! isModal && <AmplifyOverviewStory /> }
		</section>
	);
}
