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
import { errorNotice } from 'calypso/state/notices/actions';
import useSuggestOnePagerContent from '../../data/use-suggest-one-pager-content';
import { getBriefExcerpt } from './brief-helpers';
import ImageUploadField from './image-upload-field';
import useSubmitBrief from './use-submit-brief';
import type { AgentStudioAgent } from '../../lib/agents';
import type { OnePagerContentField } from '../../types';
import type { FormEvent } from 'react';

interface Props {
	agent: AgentStudioAgent;
}

export default function OnePagerBriefForm( { agent }: Props ) {
	const dispatch = useDispatch();
	const [ brief, setBrief ] = useState( '' );
	const [ title, setTitle ] = useState( '' );
	const [ blurb, setBlurb ] = useState( '' );
	// Captured for the brief, wired to the agent once generation is built.
	const [ images, setImages ] = useState< File[] >( [] );

	const mutation = useSubmitBrief( agent.id );

	const suggestion = useSuggestOnePagerContent( {
		onSuccess: ( value, variables ) => {
			if ( variables.field === 'title' ) {
				setTitle( value );
			} else {
				setBlurb( value );
			}
		},
		onError: () => {
			dispatch( errorNotice( __( 'Could not suggest content. Please try again.' ) ) );
		},
	} );

	// At least one image is required so June has a cover to design around.
	const canSubmit = !! brief.trim() && !! title.trim() && images.length > 0 && ! mutation.isPending;
	const canSuggest = !! brief.trim() && ! suggestion.isPending && ! mutation.isPending;
	const suggestingField = suggestion.isPending ? suggestion.variables?.field : undefined;

	const onSubmit = ( event: FormEvent ) => {
		event.preventDefault();

		if ( ! canSubmit ) {
			return;
		}

		mutation.mutate( {
			agentId: agent.id,
			agentName: agent.name,
			deliverableType: agent.deliverableType,
			title: title.trim(),
			description: blurb.trim() || getBriefExcerpt( brief ),
		} );
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
		<form onSubmit={ onSubmit }>
			<VStack spacing={ 5 }>
				<TextareaControl
					label={ __( 'Your content' ) }
					help={ __( 'Paste in your written content and I’ll design the layout.' ) }
					value={ brief }
					onChange={ setBrief }
					rows={ 8 }
					disabled={ mutation.isPending }
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
						disabled={ mutation.isPending }
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
						disabled={ mutation.isPending }
						__nextHasNoMarginBottom
					/>
				</VStack>

				<ImageUploadField
					agentId={ agent.id }
					label={ __( 'Images' ) }
					help={ __( 'Add at least one image and I’ll place them in the design.' ) }
					images={ images }
					onChange={ setImages }
					disabled={ mutation.isPending }
					firstImageIsCover
				/>

				<HStack className="a4a-agent-studio-brief__form-actions" justify="flex-end" spacing={ 2 }>
					<Button
						variant="primary"
						type="submit"
						disabled={ ! canSubmit }
						isBusy={ mutation.isPending }
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
