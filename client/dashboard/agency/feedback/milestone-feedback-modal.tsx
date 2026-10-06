import ExperienceControl from '@automattic/components/src/experience-control';
import {
	Button,
	CheckboxControl,
	Modal,
	TextareaControl,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useId, useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { getFeedbackCopy, type FeedbackCopyArgs } from './copy';
import { useMilestoneFeedback } from './use-milestone-feedback';
import type { FeedbackRating, FeedbackType } from './types';

interface Props {
	type: FeedbackType;
	args?: FeedbackCopyArgs;
	onClose: () => void;
}

export default function MilestoneFeedbackModal( { type, args, onClose }: Props ) {
	const { submit, skip, isSubmitting } = useMilestoneFeedback( type );
	const [ rating, setRating ] = useState< FeedbackRating >();
	const [ comments, setComments ] = useState( '' );
	const [ suggestions, setSuggestions ] = useState< string[] >( [] );
	const suggestionLabelId = useId();

	const { title, description, suggestion } = getFeedbackCopy( type, args );

	// Dismissing is a decision not to answer, so it is recorded as a skip.
	const close = () => {
		skip();
		onClose();
	};

	const toggleSuggestion = ( value: string ) =>
		setSuggestions( ( current ) =>
			current.includes( value )
				? current.filter( ( item ) => item !== value )
				: [ ...current, value ]
		);

	return (
		<Modal
			title={ title }
			onRequestClose={ close }
			size="medium"
			isDismissible={ ! isSubmitting }
			shouldCloseOnEsc={ ! isSubmitting }
			shouldCloseOnClickOutside={ false }
		>
			<VStack spacing={ 6 }>
				<Text>{ description }</Text>
				<ExperienceControl
					label={ __( 'What was your experience like?' ) }
					value={ rating }
					onChange={ setRating }
				/>
				{ suggestion && (
					<VStack spacing={ 2 } role="group" aria-labelledby={ suggestionLabelId }>
						<Text id={ suggestionLabelId }>{ suggestion.label }</Text>
						{ suggestion.options.map( ( option ) => (
							<CheckboxControl
								key={ option.value }
								__nextHasNoMarginBottom
								label={ option.label }
								checked={ suggestions.includes( option.value ) }
								onChange={ () => toggleSuggestion( option.value ) }
							/>
						) ) }
					</VStack>
				) }
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'Share your suggestions' ) }
					value={ comments }
					onChange={ setComments }
				/>
				<ButtonStack justify="flex-end">
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						onClick={ close }
						disabled={ isSubmitting }
					>
						{ __( 'Skip' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						isBusy={ isSubmitting }
						disabled={ ! rating || isSubmitting }
						onClick={ () => {
							if ( rating ) {
								submit( { rating, comments, suggestions }, { onSuccess: onClose } );
							}
						} }
					>
						{ __( 'Send your feedback' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
