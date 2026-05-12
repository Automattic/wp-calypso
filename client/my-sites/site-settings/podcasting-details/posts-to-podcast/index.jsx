// eslint-disable-next-line import/named
import { readTeamsQuery } from '@automattic/api-queries';
import { Card, FormLabel } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import Notice from 'calypso/components/notice';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { getLengthPresets, getVoicePresets, getWindowPresets } from './presets';
import { usePostsToPodcastJob } from './use-posts-to-podcast';

export function PostsToPodcastSection( { siteId, siteSlug } ) {
	const translate = useTranslate();
	const { data: teamsData, isLoading: teamsLoading } = useQuery( readTeamsQuery() );

	const windowPresets = useMemo( () => getWindowPresets( translate ), [ translate ] );
	const lengthPresets = useMemo( () => getLengthPresets( translate ), [ translate ] );
	const voicePresets = useMemo( () => getVoicePresets( translate ), [ translate ] );

	const [ windowId, setWindowId ] = useState( windowPresets[ 0 ].id );
	const [ lengthId, setLengthId ] = useState( 'medium' );
	const [ voiceId, setVoiceId ] = useState( voicePresets[ 0 ].id );

	const { status, result, error, generate, reset } = usePostsToPodcastJob( siteId );

	if ( teamsLoading || ! isAutomatticTeamMember( teamsData?.teams ?? [] ) ) {
		return null;
	}

	const isPolling = status === 'polling';

	const onGenerate = () => {
		const preset = windowPresets.find( ( p ) => p.id === windowId );
		if ( ! preset ) {
			return;
		}
		generate( {
			window: { unit: preset.unit, n: preset.n },
			length: lengthId,
			voicePreset: voiceId,
		} );
	};

	return (
		<>
			<SettingsSectionHeader title={ translate( 'Generate episode from recent posts' ) } />
			<Card className="site-settings__card">
				<FormFieldset>
					<FormLabel htmlFor="posts-to-podcast-window">{ translate( 'Window' ) }</FormLabel>
					<FormSelect
						id="posts-to-podcast-window"
						value={ windowId }
						onChange={ ( e ) => setWindowId( e.target.value ) }
						disabled={ isPolling }
					>
						{ windowPresets.map( ( p ) => (
							<option key={ p.id } value={ p.id }>
								{ p.label }
							</option>
						) ) }
					</FormSelect>
					<FormSettingExplanation>
						{ translate( 'Which posts to draw from.' ) }
					</FormSettingExplanation>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="posts-to-podcast-length">{ translate( 'Length' ) }</FormLabel>
					<FormSelect
						id="posts-to-podcast-length"
						value={ lengthId }
						onChange={ ( e ) => setLengthId( e.target.value ) }
						disabled={ isPolling }
					>
						{ lengthPresets.map( ( p ) => (
							<option key={ p.id } value={ p.id }>
								{ p.label }
							</option>
						) ) }
					</FormSelect>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="posts-to-podcast-voice">{ translate( 'Voice' ) }</FormLabel>
					<FormSelect
						id="posts-to-podcast-voice"
						value={ voiceId }
						onChange={ ( e ) => setVoiceId( e.target.value ) }
						disabled={ isPolling }
					>
						{ voicePresets.map( ( p ) => (
							<option key={ p.id } value={ p.id }>
								{ p.label }
							</option>
						) ) }
					</FormSelect>
				</FormFieldset>

				<Button variant="primary" onClick={ onGenerate } disabled={ isPolling }>
					{ isPolling ? translate( 'Generating…' ) : translate( 'Generate' ) }
				</Button>

				{ status === 'polling' && (
					<Notice status="is-info" showDismiss={ false }>
						{ translate(
							'Generating episode script — this usually takes 2–3 minutes. You can leave this page and come back.'
						) }
					</Notice>
				) }
				{ status === 'succeeded' && result?.postId && (
					<Notice status="is-success" onDismissClick={ reset }>
						{ translate( 'Draft created.' ) }
						<Button
							variant="primary"
							href={ `/post/${ siteSlug }/${ result.postId }` }
							style={ { marginInlineStart: '8px' } }
						>
							{ translate( 'Open draft' ) }
						</Button>
						<Button variant="link" href={ `/posts/drafts/${ siteSlug }` }>
							{ translate( 'View drafts' ) }
						</Button>
					</Notice>
				) }
				{ status === 'failed' && (
					<Notice status="is-error" onDismissClick={ reset }>
						{ error?.message || translate( 'Generation failed. Please try again.' ) }
					</Notice>
				) }
			</Card>
		</>
	);
}
