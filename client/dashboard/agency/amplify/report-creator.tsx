import { startAmplifyReportMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { RadioControl, Spinner, __experimentalHeading as Heading } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { Text } from '../../components/text';
import AmplifyOverviewStory from './overview-story';
import { WebsiteAddressPicker, getStartErrorMessage } from './scan-form';
import AmplifyScorePreview from './score-preview';
import { normalizeAmplifyUrl } from './url';
import type { SiteOption } from './scan-form';
import type { AmplifyMode, AmplifyUsage } from '@automattic/api-core';

const REPORT_MODES: {
	value: AmplifyMode;
	label: string;
	description: string;
}[] = [
	{
		value: 'full',
		label: __( 'Full report' ),
		description: __( 'First-time visitors and AI systems in one report.' ),
	},
	{
		value: 'human',
		label: __( 'First-time visitors' ),
		description: __( 'How the site comes across to someone seeing it for the first time.' ),
	},
	{
		value: 'ai',
		label: __( 'AI systems' ),
		description: __( 'How AI tools like ChatGPT and Perplexity read and rank the site.' ),
	},
];

export default function AmplifyReportCreator( {
	agencyId,
	usage,
	initialUrl = '',
	initialMode = 'full',
	isModal = false,
	onCreated,
}: {
	agencyId: number;
	usage?: AmplifyUsage;
	initialUrl?: string;
	initialMode?: AmplifyMode;
	isModal?: boolean;
	onCreated: () => void;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice } = useDispatch( noticesStore );
	const start = useMutation( startAmplifyReportMutation( agencyId ) );
	const atLimit = !! usage && usage.used >= usage.limit;
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
		if ( atLimit ) {
			setUrlError( __( 'You’ve reached the current scan limit. Please try again later.' ) );
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
					createSuccessNotice( __( 'Analysis started. Your report is being built.' ), {
						type: 'snackbar',
					} );
					onCreated();
				},
				onError: ( error ) => setUrlError( getStartErrorMessage( error ) ),
			}
		);
	};

	return (
		<section
			className="dashboard-amplify-overview"
			data-context={ isModal ? 'modal' : 'empty' }
			aria-labelledby={ isModal ? undefined : 'dashboard-amplify-title' }
		>
			{ ! isModal && (
				<div className="dashboard-amplify-overview__hero-preview">
					<AmplifyScorePreview mode={ mode } />
				</div>
			) }
			{ ! isModal && (
				<div className="dashboard-amplify-overview__intro">
					<Heading id="dashboard-amplify-title" level={ 2 }>
						{ __( 'Win your next client with a homepage analysis' ) }
					</Heading>
					<div className="dashboard-amplify-overview__summary">
						<Text>
							{ __(
								'Enter a prospect’s homepage. You get a branded report on what’s holding it back and how you’d fix it, ready for the pitch.'
							) }
						</Text>
					</div>
				</div>
			) }
			<form className="dashboard-amplify-overview__url-form" onSubmit={ handleSubmit }>
				<div className="dashboard-amplify-overview__url-row">
					<WebsiteAddressPicker
						agencyId={ agencyId }
						label={ __( 'Homepage' ) }
						placeholder={ __( 'prospect.com, or one of your client sites' ) }
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
						disabled={ start.isPending || ! agencyId || atLimit }
					>
						{ start.isPending ? <Spinner /> : __( 'Create report' ) }
					</button>
				</div>
				{ urlError && (
					<p className="dashboard-amplify-overview__url-error" role="alert">
						{ urlError }
					</p>
				) }
				{ atLimit && ! urlError && (
					<p className="dashboard-amplify-overview__url-error" role="status">
						{ __( 'You’ve reached the current scan limit. Please try again later.' ) }
					</p>
				) }
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
