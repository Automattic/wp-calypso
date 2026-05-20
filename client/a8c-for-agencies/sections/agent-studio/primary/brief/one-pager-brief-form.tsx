import pageRouter from '@automattic/calypso-router';
import {
	Button,
	TextControl,
	TextareaControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import useDeleteAgentStudioOutput from '../../data/use-delete-agent-studio-output';
import { getAgentStudioOutputPath, getAgentStudioPath } from '../../lib/paths';
import { getBriefExcerpt } from './brief-helpers';
import GeneratingOverlay from './generating-overlay';
import ImageUploadField from './image-upload-field';
import LogoUploadField from './logo-upload-field';
import useSubmitOnePagerBrief from './use-submit-one-pager-brief';
import type { AgentStudioAgent } from '../../lib/agents';
import type { DualLogoOrder } from '../../types';
import type { FormEvent } from 'react';

interface Props {
	agent: AgentStudioAgent;
}

export default function OnePagerBriefForm( { agent }: Props ) {
	const dispatch = useDispatch();
	const [ brief, setBrief ] = useState( '' );
	const [ title, setTitle ] = useState( '' );
	const [ blurb, setBlurb ] = useState( '' );
	const [ logoFile, setLogoFile ] = useState< File | null >( null );
	const [ partnerLogoFile, setPartnerLogoFile ] = useState< File | null >( null );
	const [ partnerLogoOrder, setPartnerLogoOrder ] = useState< DualLogoOrder >( 'leading' );
	const [ images, setImages ] = useState< File[] >( [] );

	const submit = useSubmitOnePagerBrief( agent );
	const deleteOutput = useDeleteAgentStudioOutput();
	const runId = submit.data?.id ?? null;
	const isOverlayActive = submit.isPending || !! runId;

	// At least one image is required so June has a cover to design around.
	const canSubmit = !! brief.trim() && !! title.trim() && images.length > 0 && ! isOverlayActive;

	const onSubmit = ( event: FormEvent ) => {
		event.preventDefault();

		if ( ! canSubmit ) {
			return;
		}

		submit.mutate( {
			title: title.trim(),
			description: blurb.trim() || getBriefExcerpt( brief ),
			brief: brief.trim(),
			blurb: blurb.trim(),
			logoFile,
			partnerLogoFile,
			partnerLogoOrder: partnerLogoFile ? partnerLogoOrder : undefined,
			imageFiles: images,
		} );
	};

	return (
		<>
			<form onSubmit={ onSubmit }>
				<VStack spacing={ 5 }>
					<TextareaControl
						label={ __( 'Your content' ) }
						help={ __( 'Paste in your written content and I’ll design the layout.' ) }
						value={ brief }
						onChange={ setBrief }
						rows={ 8 }
						disabled={ isOverlayActive }
						__nextHasNoMarginBottom
					/>

					<VStack spacing={ 2 }>
						<Text weight={ 600 }>{ __( 'Title' ) }</Text>
						<TextControl
							label={ __( 'Title' ) }
							hideLabelFromVision
							placeholder={ __( 'A clear, confident headline for the cover' ) }
							value={ title }
							onChange={ setTitle }
							disabled={ isOverlayActive }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					</VStack>

					<VStack spacing={ 2 }>
						<Text weight={ 600 }>{ __( 'Blurb (optional)' ) }</Text>
						<TextareaControl
							label={ __( 'Blurb' ) }
							hideLabelFromVision
							placeholder={ __( 'A short summary that frames the document' ) }
							value={ blurb }
							onChange={ setBlurb }
							rows={ 3 }
							disabled={ isOverlayActive }
							__nextHasNoMarginBottom
						/>
					</VStack>

					<VStack spacing={ 2 }>
						<Text weight={ 600 }>{ __( 'Logos (optional)' ) }</Text>
						<Text variant="muted">
							{ __( 'Add a primary brand logo and an optional partner logo for the cover.' ) }
						</Text>
						<HStack className="a4a-agent-studio-brief__logo-row" justify="flex-start">
							<LogoUploadField
								label={ __( 'Primary logo' ) }
								file={ logoFile }
								onChange={ setLogoFile }
								disabled={ isOverlayActive }
							/>
							<LogoUploadField
								label={ __( 'Partner logo' ) }
								file={ partnerLogoFile }
								onChange={ setPartnerLogoFile }
								disabled={ isOverlayActive }
							/>
						</HStack>
						{ partnerLogoFile && (
							<ToggleGroupControl
								label={ __( 'Partner logo position' ) }
								value={ partnerLogoOrder }
								onChange={ ( value ) => setPartnerLogoOrder( value as DualLogoOrder ) }
								disabled={ isOverlayActive }
								isBlock
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							>
								<ToggleGroupControlOption value="leading" label={ __( 'Leading' ) } />
								<ToggleGroupControlOption value="trailing" label={ __( 'Trailing' ) } />
							</ToggleGroupControl>
						) }
					</VStack>

					<ImageUploadField
						agentId={ agent.id }
						label={ __( 'Images' ) }
						help={ __( 'Add at least one image and I’ll place them in the design.' ) }
						images={ images }
						onChange={ setImages }
						disabled={ isOverlayActive }
						firstImageIsCover
					/>

					<HStack className="a4a-agent-studio-brief__form-actions" justify="flex-end" spacing={ 2 }>
						<Button
							variant="primary"
							type="submit"
							disabled={ ! canSubmit }
							isBusy={ isOverlayActive }
						>
							{ sprintf(
								/* translators: %s is an agent name. */
								__( 'Send it to %s' ),
								agent.name
							) }
						</Button>
					</HStack>
				</VStack>
			</form>
			<GeneratingOverlay
				agentName={ agent.name }
				runId={ runId }
				isUploading={ submit.isPending }
				onReady={ ( readyRunId ) => {
					pageRouter( getAgentStudioOutputPath( readyRunId ) );
				} }
				onFailed={ ( message ) => {
					dispatch(
						errorNotice(
							message || __( 'Something went wrong while generating your deliverable.' )
						)
					);
					submit.reset();
				} }
				onCancel={ () => {
					// DELETE server-side so the orphaned run doesn't keep
					// burning pipeline cycles. Don't await — the overview
					// skips the row once the user navigates away.
					if ( runId ) {
						deleteOutput.mutate( runId );
					}
					submit.reset();
					pageRouter( getAgentStudioPath() );
				} }
			/>
		</>
	);
}
