import pageRouter from '@automattic/calypso-router';
import { BigSkyLogo } from '@automattic/components/src/logos/big-sky-logo';
import {
	Button,
	TextControl,
	TextareaControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useCreateAgentStudioOutput from '../../data/use-create-agent-studio-output';
import { getAgentStudioOutputPath } from '../../lib/paths';
import { DEFAULT_PACK_SLUG } from '../../one-pager/brand-packs';
import GeneratingOverlay from '../../one-pager/react/generating-overlay';
import { useOnePagerGeneration } from '../../one-pager/react/use-one-pager-generation';
import useSuggestOnePagerContent from '../../one-pager/react/use-suggest-one-pager-content';
import { getBriefExcerpt } from './brief-helpers';
import ImageUploadField from './image-upload-field';
import LogoUploadField from './logo-upload-field';
import type { AgentStudioAgent } from '../../lib/agents';
import type { DualLogoOrder, ElaImage, LogoUpload } from '../../one-pager/engine/types';
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
	const [ primaryLogoLight, setPrimaryLogoLight ] = useState< File | null >( null );
	const [ primaryLogoDark, setPrimaryLogoDark ] = useState< File | null >( null );
	const [ partnerLogoLight, setPartnerLogoLight ] = useState< File | null >( null );
	const [ partnerLogoDark, setPartnerLogoDark ] = useState< File | null >( null );
	const [ partnerLogoOrder, setPartnerLogoOrder ] = useState< DualLogoOrder >( 'brand-first' );

	const generation = useOnePagerGeneration();
	const createOutput = useCreateAgentStudioOutput();
	const suggestion = useSuggestOnePagerContent();
	const [ suggestingFields, setSuggestingFields ] = useState< Set< OnePagerContentField > >(
		() => new Set()
	);

	const isBusy = createOutput.isPending || generation.isRunning;
	// Primary logo is required because the neutral brand pack ships without
	// one — without it covers and footers render with a transparent stand-in.
	const canSubmit =
		!! brief.trim() && !! title.trim() && images.length > 0 && !! primaryLogoLight && ! isBusy;
	const hasPartnerLogo = !! partnerLogoLight || !! partnerLogoDark;
	const isFieldSuggesting = ( field: OnePagerContentField ) => suggestingFields.has( field );
	const canSuggestField = ( field: OnePagerContentField ) =>
		!! brief.trim() && ! isBusy && ! isFieldSuggesting( field );

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

			const toLogoUpload = async ( file: File | null ): Promise< LogoUpload | undefined > => {
				if ( ! file ) {
					return undefined;
				}
				return { fileName: file.name, dataUrl: await readAsDataUrl( file ) };
			};
			const [
				primaryLogoLightUpload,
				primaryLogoDarkUpload,
				partnerLogoLightUpload,
				partnerLogoDarkUpload,
			] = await Promise.all( [
				toLogoUpload( primaryLogoLight ),
				toLogoUpload( primaryLogoDark ),
				toLogoUpload( partnerLogoLight ),
				toLogoUpload( partnerLogoDark ),
			] );

			const result = await generation.run( {
				outputId: output.id,
				agentId: agent.id,
				pack: DEFAULT_PACK_SLUG,
				title: title.trim(),
				blurb: blurb.trim(),
				text: brief,
				images: elaImages,
				primaryLogoLight: primaryLogoLightUpload,
				primaryLogoDark: primaryLogoDarkUpload,
				partnerLogoLight: partnerLogoLightUpload,
				partnerLogoDark: partnerLogoDarkUpload,
				partnerLogoOrder: hasPartnerLogo ? partnerLogoOrder : undefined,
			} );

			if ( result.ok ) {
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
			} else {
				// Stay on the brief screen so the user can read the error and
				// fix the input (e.g. an invalid model id or a missing key)
				// without losing what they typed.
				dispatch(
					errorNotice( result.error, {
						duration: 12000,
						id: `one-pager-generation-failed-${ output.id }`,
					} )
				);
			}
		} catch ( error ) {
			const message =
				error instanceof Error
					? error.message
					: __( 'Could not start the deliverable. Please try again.' );
			dispatch( errorNotice( message ) );
		}
	};

	const onSuggest = async ( field: OnePagerContentField ) => {
		if ( ! canSuggestField( field ) ) {
			return;
		}
		dispatch(
			recordTracksEvent( 'calypso_a4a_agent_studio_suggest_content', {
				agent_id: agent.id,
				field,
			} )
		);
		setSuggestingFields( ( prev ) => {
			const next = new Set( prev );
			next.add( field );
			return next;
		} );
		try {
			const value = await suggestion.mutateAsync( { brief, field } );
			if ( field === 'title' ) {
				setTitle( value );
			} else {
				setBlurb( value );
			}
		} catch ( error ) {
			const message =
				error instanceof Error && error.message
					? error.message
					: __( 'Could not suggest content. Please try again.' );
			dispatch( errorNotice( message ) );
		} finally {
			setSuggestingFields( ( prev ) => {
				const next = new Set( prev );
				next.delete( field );
				return next;
			} );
		}
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
								isBusy={ isFieldSuggesting( 'title' ) }
								disabled={ ! canSuggestField( 'title' ) }
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
								isBusy={ isFieldSuggesting( 'blurb' ) }
								disabled={ ! canSuggestField( 'blurb' ) }
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

					<VStack spacing={ 3 }>
						<Text weight={ 600 }>{ __( 'Brand logo' ) }</Text>
						<Text variant="muted">
							{ __(
								'Sits on every cover and footer. Add a dark-page variant if your logo doesn’t read on inky pages.'
							) }
						</Text>
						<HStack spacing={ 4 } justify="flex-start" alignment="flex-start">
							<LogoUploadField
								label={ __( 'Light-page logo' ) }
								help={ __( 'For white and light backgrounds.' ) }
								file={ primaryLogoLight }
								onChange={ setPrimaryLogoLight }
								disabled={ isBusy }
								uploadLabel={ __( 'Upload logo' ) }
							/>
							<LogoUploadField
								label={ __( 'Dark-page logo (optional)' ) }
								help={ __( 'Falls back to the light variant.' ) }
								file={ primaryLogoDark }
								onChange={ setPrimaryLogoDark }
								disabled={ isBusy }
								darkBackground
								uploadLabel={ __( 'Upload dark variant' ) }
							/>
						</HStack>
					</VStack>

					<VStack spacing={ 3 }>
						<Text weight={ 600 }>{ __( 'Partner logo (optional)' ) }</Text>
						<Text variant="muted">
							{ __( 'For co-branded pieces. Sits next to your brand logo with a separator.' ) }
						</Text>
						<HStack spacing={ 4 } justify="flex-start" alignment="flex-start">
							<LogoUploadField
								label={ __( 'Light-page logo' ) }
								help={ __( 'For white and light backgrounds.' ) }
								file={ partnerLogoLight }
								onChange={ setPartnerLogoLight }
								disabled={ isBusy }
								uploadLabel={ __( 'Upload partner logo' ) }
							/>
							<LogoUploadField
								label={ __( 'Dark-page logo (optional)' ) }
								help={ __( 'Falls back to the light variant.' ) }
								file={ partnerLogoDark }
								onChange={ setPartnerLogoDark }
								disabled={ isBusy }
								darkBackground
								uploadLabel={ __( 'Upload dark variant' ) }
							/>
						</HStack>
						{ hasPartnerLogo && (
							<ToggleGroupControl
								label={ __( 'Logo order' ) }
								help={ __( 'Which logo sits on the left of the separator.' ) }
								value={ partnerLogoOrder }
								onChange={ ( value ) =>
									setPartnerLogoOrder( ( value ?? 'brand-first' ) as DualLogoOrder )
								}
								isBlock={ false }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							>
								<ToggleGroupControlOption value="brand-first" label={ __( 'Brand first' ) } />
								<ToggleGroupControlOption value="partner-first" label={ __( 'Partner first' ) } />
							</ToggleGroupControl>
						) }
					</VStack>

					<HStack className="a4a-agent-studio-brief__form-actions" justify="flex-end" spacing={ 2 }>
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
