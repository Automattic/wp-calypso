import {
	Button,
	CheckboxControl,
	Modal,
	TextareaControl,
	__experimentalText as Text,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { getFeedbackCopy, type FeedbackCopyArgs } from './copy';
import { useMilestoneFeedback } from './use-milestone-feedback';
import type { FeedbackRating, FeedbackType } from './types';

const RATINGS: FeedbackRating[] = [ 'bad', 'neutral', 'good' ];

function toRating( value: string | number | undefined ): FeedbackRating | undefined {
	return RATINGS.find( ( rating ) => rating === value );
}

interface Props {
	type: FeedbackType;
	args?: FeedbackCopyArgs;
	onClose: () => void;
}

export default function MilestoneFeedbackModal( { type, args, onClose }: Props ) {
	const { submit, skip, isSubmitting } = useMilestoneFeedback( type );
	const [ rating, setRating ] = useState< FeedbackRating >( 'good' );
	const [ comments, setComments ] = useState( '' );
	const [ suggestions, setSuggestions ] = useState< string[] >( [] );

	const { title, description, suggestion } = getFeedbackCopy( type, args );

	const ratingLabels: Record< FeedbackRating, string > = {
		bad: __( 'Bad' ),
		neutral: __( 'Neutral' ),
		good: __( 'Good' ),
	};

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
		<Modal title={ title } onRequestClose={ close } size="medium">
			<VStack spacing={ 6 }>
				<Text>{ description }</Text>
				<ToggleGroupControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					isBlock
					label={ __( 'What was your experience like?' ) }
					value={ rating }
					onChange={ ( value ) => {
						const next = toRating( value );
						if ( next ) {
							setRating( next );
						}
					} }
				>
					{ RATINGS.map( ( value ) => (
						<ToggleGroupControlOption
							key={ value }
							value={ value }
							label={ ratingLabels[ value ] }
						/>
					) ) }
				</ToggleGroupControl>
				{ suggestion && (
					<VStack spacing={ 2 } as="fieldset">
						<Text as="legend">{ suggestion.label }</Text>
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
						disabled={ isSubmitting }
						onClick={ () => submit( { rating, comments, suggestions }, { onSuccess: onClose } ) }
					>
						{ __( 'Send your feedback' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
