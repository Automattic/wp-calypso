import {
	Button,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { getBriefExcerpt } from './brief-helpers';
import GeneratingOverlay from './generating-overlay';
import ImageUploadField from './image-upload-field';
import LogoUploadField from './logo-upload-field';
import useSubmitSocialBrief from './use-submit-social-brief';
import type { AgentStudioAgent } from '../../lib/agents';
import type { FormEvent } from 'react';

interface Props {
	agent: AgentStudioAgent;
}

const DELIVERABLE_SIZES = [
	{ label: __( 'Cover' ), dimensions: '1200×630' },
	{ label: __( 'Square' ), dimensions: '1080×1080' },
	{ label: __( 'Email' ), dimensions: '600×300' },
	{ label: __( 'Story' ), dimensions: '1080×1920' },
];

export default function SocialAssetsBriefForm( { agent }: Props ) {
	const [ headline, setHeadline ] = useState( '' );
	const [ stat, setStat ] = useState( '' );
	const [ statContext, setStatContext ] = useState( '' );
	const [ logoFile, setLogoFile ] = useState< File | null >( null );
	const [ lightLogoFile, setLightLogoFile ] = useState< File | null >( null );
	const [ images, setImages ] = useState< File[] >( [] );

	const mutation = useSubmitSocialBrief( agent );

	const canSubmit = ! mutation.isPending && !! headline.trim();

	const onSubmit = ( event: FormEvent ) => {
		event.preventDefault();

		if ( ! canSubmit ) {
			return;
		}

		const title = headline.trim();
		const description =
			getBriefExcerpt( [ stat.trim(), statContext.trim() ].filter( Boolean ).join( ' ' ) ) ||
			agent.role;

		mutation.mutate( {
			title,
			description,
			headline: title,
			stat: stat.trim(),
			statContext: statContext.trim(),
			logoFile,
			lightLogoFile,
			imageFiles: images,
		} );
	};

	return (
		<>
			<form onSubmit={ onSubmit }>
				<VStack spacing={ 5 }>
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

					<ImageUploadField
						agentId={ agent.id }
						label={ __( 'Image (optional)' ) }
						images={ images }
						onChange={ setImages }
						disabled={ mutation.isPending }
					/>

					<VStack spacing={ 2 }>
						<Text weight={ 600 }>{ __( 'Logo (optional)' ) }</Text>
						<Text variant="muted">
							{ __( 'Add a brand logo and an optional light logo for dark layouts.' ) }
						</Text>
						<HStack className="a4a-agent-studio-brief__logo-row" justify="flex-start">
							<LogoUploadField
								label={ __( 'Brand logo' ) }
								file={ logoFile }
								onChange={ setLogoFile }
								disabled={ mutation.isPending }
							/>
							<LogoUploadField
								label={ __( 'Light logo' ) }
								file={ lightLogoFile }
								onChange={ setLightLogoFile }
								disabled={ mutation.isPending }
								darkBackground
							/>
						</HStack>
					</VStack>

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
			<GeneratingOverlay
				agentName={ agent.name }
				isOpen={ mutation.isPending }
				onCancel={ () => mutation.reset() }
			/>
		</>
	);
}
