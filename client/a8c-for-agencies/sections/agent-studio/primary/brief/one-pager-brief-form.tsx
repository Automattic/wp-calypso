import pageRouter from '@automattic/calypso-router';
import { BigSkyLogo } from '@automattic/components/src/logos/big-sky-logo';
import {
	Button,
	TextControl,
	TextareaControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useCreateAgentStudioOutput from '../../data/use-create-agent-studio-output';
import { getAgentStudioOutputPath, getAgentStudioPath } from '../../lib/paths';
import { DEFAULT_PACK_SLUG } from '../../one-pager/brand-packs';
import DevKeyModal, { DevKeyTrigger } from '../../one-pager/react/dev-key-modal';
import GeneratingOverlay from '../../one-pager/react/generating-overlay';
import { useOnePagerGeneration } from '../../one-pager/react/use-one-pager-generation';
import useSuggestOnePagerContent from '../../one-pager/react/use-suggest-one-pager-content';
import { getBriefExcerpt } from './brief-helpers';
import ImageUploadField from './image-upload-field';
import type { AgentStudioAgent } from '../../lib/agents';
import type { ElaImage } from '../../one-pager/engine/types';
import type { OnePagerContentField } from '../../types';
import type { FormEvent } from 'react';

interface Props {
	agent: AgentStudioAgent;
}

function readAsDataUrl( file: File ): Promise< string > {
	return new Promise( ( resolve, reject ) => {
		const reader = new FileReader();
		reader.onload = () => resolve( reader.result as string );
		reader.onerror = () => reject( reader.error );
		reader.readAsDataURL( file );
	} );
}

export default function OnePagerBriefForm( { agent }: Props ) {
	const dispatch = useDispatch();
	const [ brief, setBrief ] = useState( '' );
	const [ title, setTitle ] = useState( '' );
	const [ blurb, setBlurb ] = useState( '' );
	const [ images, setImages ] = useState< File[] >( [] );
	const [ devKeyOpen, setDevKeyOpen ] = useState( false );

	const generation = useOnePagerGeneration();
	const createOutput = useCreateAgentStudioOutput();

	const suggestion = useSuggestOnePagerContent( {
		onSuccess: ( value, variables ) => {
			if ( variables.field === 'title' ) {
				setTitle( value );
			} else {
				setBlurb( value );
			}
		},
		onError: ( error ) => {
			dispatch(
				errorNotice( error.message || __( 'Could not suggest content. Please try again.' ) )
			);
		},
	} );

	const isBusy = createOutput.isPending || generation.isRunning;
	const canSubmit = !! brief.trim() && !! title.trim() && images.length > 0 && ! isBusy;
	const canSuggest = !! brief.trim() && ! suggestion.isPending && ! isBusy;
	const suggestingField = suggestion.isPending ? suggestion.variables?.field : undefined;

	const onSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		if ( ! canSubmit ) {
			return;
		}

		const description = blurb.trim() || getBriefExcerpt( brief );

		try {
			const output = await createOutput.mutateAsync( {
				agentId: agent.id,
				agentName: agent.name,
				deliverableType: agent.deliverableType,
				kind: 'one-pager',
				title: title.trim(),
				description,
			} );

			dispatch(
				recordTracksEvent( 'calypso_a4a_agent_studio_output_created', {
					agent_id: agent.id,
					output_id: output.id,
				} )
			);

			const elaImages: ElaImage[] = await Promise.all(
				images.map( async ( file ) => ( {
					fileName: file.name,
					dataUrl: await readAsDataUrl( file ),
				} ) )
			);

			const ok = await generation.run( {
				outputId: output.id,
				agentId: agent.id,
				pack: DEFAULT_PACK_SLUG,
				title: title.trim(),
				blurb: blurb.trim(),
				text: brief,
				images: elaImages,
			} );

			if ( ok ) {
				dispatch(
					successNotice(
						sprintf(
							/* translators: %s is an agent name. */
							__( '%s finished your deliverable.' ),
							agent.name
						),
						{ duration: 5000 }
					)
				);
				pageRouter( getAgentStudioOutputPath( output.id ) );
			} else if ( generation.error ) {
				dispatch( errorNotice( generation.error ) );
				pageRouter( getAgentStudioPath() );
			}
		} catch ( error ) {
			const message =
				error instanceof Error
					? error.message
					: __( 'Could not start the deliverable. Please try again.' );
			dispatch( errorNotice( message ) );
		}
	};

	const onSuggest = ( field: OnePagerContentField ) => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_agent_studio_suggest_content', {
				agent_id: agent.id,
				field,
			} )
		);
		suggestion.mutate( { brief, field } );
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
						disabled={ isBusy }
						__nextHasNoMarginBottom
					/>

					<VStack spacing={ 2 }>
						<HStack justify="space-between" alignment="center">
							<Text weight={ 600 }>{ __( 'Title' ) }</Text>
							<SuggestButton
								isBusy={ suggestingField === 'title' }
								disabled={ ! canSuggest }
								onClick={ () => onSuggest( 'title' ) }
							/>
						</HStack>
						<TextControl
							label={ __( 'Title' ) }
							hideLabelFromVision
							placeholder={ __( 'A clear, confident headline for the cover' ) }
							value={ title }
							onChange={ setTitle }
							disabled={ isBusy }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					</VStack>

					<VStack spacing={ 2 }>
						<HStack justify="space-between" alignment="center">
							<Text weight={ 600 }>{ __( 'Blurb (optional)' ) }</Text>
							<SuggestButton
								isBusy={ suggestingField === 'blurb' }
								disabled={ ! canSuggest }
								onClick={ () => onSuggest( 'blurb' ) }
							/>
						</HStack>
						<TextareaControl
							label={ __( 'Blurb' ) }
							hideLabelFromVision
							placeholder={ __( 'A short summary that frames the document' ) }
							value={ blurb }
							onChange={ setBlurb }
							rows={ 3 }
							disabled={ isBusy }
							__nextHasNoMarginBottom
						/>
					</VStack>

					<ImageUploadField
						agentId={ agent.id }
						label={ __( 'Images' ) }
						help={ __( 'Add at least one image and I’ll place them in the design.' ) }
						images={ images }
						onChange={ setImages }
						disabled={ isBusy }
						firstImageIsCover
					/>

					<HStack
						className="a4a-agent-studio-brief__form-actions"
						justify="space-between"
						spacing={ 2 }
					>
						<DevKeyTrigger onOpen={ () => setDevKeyOpen( true ) } />
						<Button variant="primary" type="submit" disabled={ ! canSubmit } isBusy={ isBusy }>
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
				isOpen={ generation.isRunning }
				onCancel={ generation.cancel }
			/>
			<DevKeyModal isOpen={ devKeyOpen } onClose={ () => setDevKeyOpen( false ) } />
		</>
	);
}

function SuggestButton( {
	isBusy,
	disabled,
	onClick,
}: {
	isBusy: boolean;
	disabled: boolean;
	onClick: () => void;
} ) {
	return (
		<Button
			variant="tertiary"
			size="compact"
			icon={ <BigSkyLogo.CentralLogo heartless size={ 20 } /> }
			onClick={ onClick }
			disabled={ disabled }
		>
			{ isBusy ? __( 'Suggesting…' ) : __( 'Suggest' ) }
		</Button>
	);
}
