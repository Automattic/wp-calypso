import {
	Button,
	RadioControl,
	TextControl,
	TextareaControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { getBriefExcerpt } from './brief-helpers';
import ImageUploadField from './image-upload-field';
import useSubmitBrief from './use-submit-brief';
import type { AgentStudioAgent } from '../../lib/agents';
import type { FormEvent } from 'react';

interface Props {
	agent: AgentStudioAgent;
}

type BriefMode = 'source' | 'manual';

const SOURCE_MIN_LENGTH = 20;

const DELIVERABLE_SIZES = [
	{ label: __( 'Cover' ), dimensions: '1200×630' },
	{ label: __( 'Square' ), dimensions: '1080×1080' },
	{ label: __( 'Email' ), dimensions: '600×300' },
	{ label: __( 'Story' ), dimensions: '1080×1920' },
];

function getFirstLine( text: string ): string {
	return (
		text
			.split( '\n' )
			.map( ( line ) => line.trim() )
			.find( Boolean ) ?? ''
	);
}

export default function SocialAssetsBriefForm( { agent }: Props ) {
	const [ mode, setMode ] = useState< BriefMode >( 'source' );
	const [ sourceText, setSourceText ] = useState( '' );
	const [ headline, setHeadline ] = useState( '' );
	const [ stat, setStat ] = useState( '' );
	const [ statContext, setStatContext ] = useState( '' );
	// Captured for the brief, wired to the agent once generation is built.
	const [ images, setImages ] = useState< File[] >( [] );

	const mutation = useSubmitBrief( agent.id );

	const canSubmit =
		! mutation.isPending &&
		( mode === 'source' ? sourceText.trim().length > SOURCE_MIN_LENGTH : !! headline.trim() );

	const onSubmit = ( event: FormEvent ) => {
		event.preventDefault();

		if ( ! canSubmit ) {
			return;
		}

		const title =
			mode === 'source'
				? getBriefExcerpt( getFirstLine( sourceText ) ) || agent.deliverableType
				: headline.trim();
		const description =
			mode === 'source'
				? getBriefExcerpt( sourceText )
				: getBriefExcerpt( [ stat.trim(), statContext.trim() ].filter( Boolean ).join( ' ' ) ) ||
				  agent.role;

		mutation.mutate( {
			agentId: agent.id,
			agentName: agent.name,
			deliverableType: agent.deliverableType,
			title,
			description,
		} );
	};

	return (
		<form onSubmit={ onSubmit }>
			<VStack spacing={ 5 }>
				<RadioControl
					label={ __( 'Start with' ) }
					selected={ mode }
					options={ [
						{ label: __( 'Source copy' ), value: 'source' },
						{ label: __( 'Manual fields' ), value: 'manual' },
					] }
					onChange={ ( value ) => setMode( value as BriefMode ) }
				/>

				{ mode === 'source' ? (
					<TextareaControl
						label={ __( 'Source material' ) }
						help={ __( 'Paste a blog post, announcement, or case study notes.' ) }
						value={ sourceText }
						onChange={ setSourceText }
						rows={ 8 }
						disabled={ mutation.isPending }
						__nextHasNoMarginBottom
					/>
				) : (
					<>
						<TextControl
							label={ __( 'Campaign headline' ) }
							placeholder={ __( 'e.g. Announcing Radical Speed Month' ) }
							value={ headline }
							onChange={ setHeadline }
							disabled={ mutation.isPending }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						<TextControl
							label={ __( 'Stat or number (optional)' ) }
							placeholder={ __( '2.3x, 94%, $12M, 4 steps' ) }
							value={ stat }
							onChange={ setStat }
							disabled={ mutation.isPending }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						<TextControl
							label={ __( 'Stat context (optional)' ) }
							placeholder={ __( 'faster launches with a simpler client stack' ) }
							value={ statContext }
							onChange={ setStatContext }
							disabled={ mutation.isPending }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					</>
				) }

				<ImageUploadField
					agentId={ agent.id }
					label={ __( 'Image (optional)' ) }
					images={ images }
					onChange={ setImages }
					disabled={ mutation.isPending }
				/>

				<VStack spacing={ 2 }>
					<Text weight={ 600 }>
						{ sprintf(
							/* translators: %s is an agent name. */
							__( '%s will deliver the following social media assets' ),
							agent.name
						) }
					</Text>
					<HStack spacing={ 2 } justify="flex-start" wrap>
						{ DELIVERABLE_SIZES.map( ( size ) => (
							<Text key={ size.label } variant="muted">
								{ sprintf(
									/* translators: %1$s is a format name, %2$s is its pixel dimensions. */
									__( '%1$s · %2$s' ),
									size.label,
									size.dimensions
								) }
							</Text>
						) ) }
					</HStack>
				</VStack>

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
