import {
	Button,
	CheckboxControl,
	TextareaControl,
	__experimentalVStack as VStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import type { FeedbackConfig, FeedbackResponses } from './types';

interface FeedbackSurveyProps {
	config: FeedbackConfig;
	description: string;
	isSubmitting: boolean;
	onSubmit: ( responses: FeedbackResponses ) => void;
	onSkip: () => void;
}

export default function FeedbackSurvey( {
	config,
	description,
	isSubmitting,
	onSubmit,
	onSkip,
}: FeedbackSurveyProps ) {
	const [ experience, setExperience ] = useState( 'good' );
	const [ comment, setComment ] = useState( '' );
	const [ suggestions, setSuggestions ] = useState< string[] >( [] );

	const toggleSuggestion = ( value: string ) =>
		setSuggestions( ( prev ) =>
			prev.includes( value ) ? prev.filter( ( v ) => v !== value ) : [ ...prev, value ]
		);

	return (
		<VStack spacing={ 6 } className="a4a-feedback-survey">
			<p>{ description }</p>

			<ToggleGroupControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'What was your experience like?' ) }
				value={ experience }
				onChange={ ( value ) => setExperience( String( value ) ) }
				isBlock
			>
				<ToggleGroupControlOption value="good" label={ __( 'Good' ) } />
				<ToggleGroupControlOption value="neutral" label={ __( 'Neutral' ) } />
				<ToggleGroupControlOption value="bad" label={ __( 'Bad' ) } />
			</ToggleGroupControl>

			{ config.suggestion && (
				<VStack spacing={ 2 }>
					<span>{ config.suggestion.label }</span>
					{ config.suggestion.options.map( ( option ) => (
						<CheckboxControl
							__nextHasNoMarginBottom
							key={ option.value }
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
				value={ comment }
				onChange={ setComment }
			/>

			<VStack spacing={ 3 }>
				<Button
					variant="primary"
					__next40pxDefaultSize
					isBusy={ isSubmitting }
					disabled={ ! experience || isSubmitting }
					onClick={ () => onSubmit( { experience, comment, suggestions } ) }
				>
					{ __( 'Send your feedback' ) }
				</Button>
				<Button
					variant="tertiary"
					__next40pxDefaultSize
					disabled={ isSubmitting }
					onClick={ onSkip }
				>
					{ __( 'Skip' ) }
				</Button>
			</VStack>
		</VStack>
	);
}
