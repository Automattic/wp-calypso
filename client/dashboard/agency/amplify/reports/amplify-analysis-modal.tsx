import { submitAmplifyAnalysisMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	Modal,
	TextControl,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { ButtonStack } from '../../../components/button-stack';
import { ANALYSIS_TYPES } from './constants';
import { normalizeUrl } from './validate-url';
import type { AmplifyMode } from '@automattic/api-core';

export default function AmplifyAnalysisModal( {
	agencyId,
	onClose,
}: {
	agencyId: number;
	onClose: () => void;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const mutation = useMutation( submitAmplifyAnalysisMutation( agencyId ) );
	const [ stage, setStage ] = useState< 'site' | 'type' >( 'site' );
	const [ url, setUrl ] = useState( '' );
	const [ normalizedUrl, setNormalizedUrl ] = useState( '' );
	const [ urlError, setUrlError ] = useState( '' );

	const handleNext = () => {
		const normalized = normalizeUrl( url );
		if ( ! normalized ) {
			setUrlError(
				__( 'That doesn’t look like a valid URL. Try something like https://example.com.' )
			);
			return;
		}
		setUrlError( '' );
		setNormalizedUrl( normalized );
		setStage( 'type' );
		recordTracksEvent( 'calypso_a4a_amplify_audit_open', {
			site_url: normalized,
			entry_point: 'reports_amplify_button',
		} );
	};

	const handleSelectType = ( mode: AmplifyMode ) => {
		recordTracksEvent( 'calypso_a4a_amplify_analysis_start', {
			analysis_type: mode,
			site_url: normalizedUrl,
		} );
		mutation.mutate( { url: normalizedUrl, mode } );
	};

	return (
		<Modal title={ __( 'Amplify a site' ) } onRequestClose={ onClose }>
			{ stage === 'site' && (
				<VStack spacing={ 4 }>
					<TextControl
						label={ __( 'Site URL' ) }
						value={ url }
						onChange={ setUrl }
						placeholder="https://yourgroovydomain.com"
						help={ urlError || undefined }
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<ButtonStack justify="flex-end">
						<Button onClick={ onClose }>{ __( 'Cancel' ) }</Button>
						<Button variant="primary" onClick={ handleNext }>
							{ __( 'Next' ) }
						</Button>
					</ButtonStack>
				</VStack>
			) }

			{ stage === 'type' && mutation.isSuccess && (
				<VStack spacing={ 4 }>
					<Heading level={ 3 }>{ __( 'Analysis in progress' ) }</Heading>
					<Text>
						{ sprintf(
							/* translators: %s is the analyzed site URL. */
							__(
								'Running your analysis for %s. This may take 10 to 20 minutes depending on the size of your site.'
							),
							normalizedUrl
						) }
					</Text>
					<Text variant="muted">
						{ __(
							'You can navigate away — your report will appear in this list when it’s ready.'
						) }
					</Text>
					<ButtonStack justify="flex-end">
						<Button variant="primary" onClick={ onClose }>
							{ __( 'View reports' ) }
						</Button>
					</ButtonStack>
				</VStack>
			) }

			{ stage === 'type' && mutation.isError && (
				<VStack spacing={ 4 }>
					<Text>
						{ __( 'We were unable to start your analysis. Please try again in a moment.' ) }
					</Text>
					<ButtonStack justify="flex-end">
						<Button onClick={ onClose }>{ __( 'Cancel' ) }</Button>
						<Button variant="primary" onClick={ () => mutation.reset() }>
							{ __( 'Try again' ) }
						</Button>
					</ButtonStack>
				</VStack>
			) }

			{ stage === 'type' && ! mutation.isSuccess && ! mutation.isError && (
				<VStack spacing={ 3 }>
					<Text>{ __( 'Choose an analysis type.' ) }</Text>
					{ ANALYSIS_TYPES.map( ( type ) => (
						<Button
							key={ type.mode }
							variant="secondary"
							onClick={ () => handleSelectType( type.mode ) }
							disabled={ mutation.isPending }
							isBusy={ mutation.isPending }
							__next40pxDefaultSize
						>
							<VStack spacing={ 1 }>
								<Text weight={ 500 }>{ type.title }</Text>
								<Text variant="muted" size={ 12 }>
									{ type.description }
								</Text>
							</VStack>
						</Button>
					) ) }
				</VStack>
			) }
		</Modal>
	);
}
