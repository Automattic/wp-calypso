import { RadioControl, TextareaControl, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { toSelectOption } from '../to-select-options';

interface Props {
	isPlan: boolean;
	adventureOptions: string[];
	onChangeText?: ( text: string ) => void;
	onSelectNextAdventure?: ( nextAdventure: string ) => void;
	onChangeNextAdventureDetails?: ( details: string ) => void;
	onValidationChange?: ( isValid: boolean ) => void;
}

export default function NextAdventureStep( props: Props ) {
	const { isPlan, onValidationChange } = props;
	const [ text, setText ] = useState( '' );
	const [ nextAdventure, setNextAdventure ] = useState( '' );
	const [ nextAdventureDetails, setNextAdventureDetails ] = useState( '' );

	const allOptions = [
		{
			value: 'stayingHere',
			label: __( "I'm staying here and using the free plan." ),
		},
		{
			value: 'otherWordPress',
			label: __( "I'm going to use WordPress somewhere else." ),
			textPlaceholder: __( 'Mind telling us where?' ),
		},
		{
			value: 'differentService',
			label: __( "I'm going to use a different service for my website or blog." ),
			textPlaceholder: __( 'Mind telling us which one?' ),
		},
		{
			value: 'noNeed',
			label: __( 'I no longer need a website or blog.' ),
			textPlaceholder: __( 'What will you do instead?' ),
		},
		{
			value: 'otherPlugin',
			label: __( 'I found a better plugin or service.' ),
			textPlaceholder: __( 'Mind telling us which one(s)?' ),
		},
		{
			value: 'leavingWP',
			label: __( "I'm moving my site off of WordPress." ),
			textPlaceholder: __( 'Any particular reason(s)?' ),
		},
		{
			value: 'anotherReasonTwo',
			label: __( 'Another reason…' ),
			textPlaceholder: __( 'Can you please specify?' ),
		},
	];

	const options = allOptions
		.filter( ( { value } ) => ! value || props.adventureOptions.includes( value ) )
		.map( toSelectOption );

	const selectedAdventureOption = allOptions.find( ( { value } ) => value === nextAdventure );

	const onDetailsChange = ( details: string ) => {
		setNextAdventureDetails( details );
		props.onChangeNextAdventureDetails?.( details );
	};

	return (
		<>
			<div className="cancel-purchase-form__feedback-question">
				<TextareaControl
					label={ __( "What's one thing we could have done better?" ) }
					value={ text }
					onChange={ ( value: string ) => {
						setText( value );
						props.onChangeText?.( value );
					} }
					placeholder={ __( 'Optional' ) }
					name="improvementInput"
					id="improvementInput"
				/>
			</div>
			{ isPlan && (
				<div className="cancel-purchase-form__feedback-question">
					<RadioControl
						label={ __( 'Where is your next adventure taking you?' ) }
						selected={ nextAdventure }
						options={ options }
						onChange={ ( value: string ) => {
							// For plans, require a selection from the adventure dropdown (not the placeholder)
							const isValid = nextAdventure !== '';
							onValidationChange?.( isValid );
							onDetailsChange( '' );
							setNextAdventure( value );
							props.onSelectNextAdventure?.( value );
						} }
					/>
				</div>
			) }
			{ selectedAdventureOption?.textPlaceholder && (
				<div className="cancel-purchase-form__feedback-question">
					<TextControl
						placeholder={ selectedAdventureOption.textPlaceholder }
						value={ nextAdventureDetails }
						onChange={ onDetailsChange }
					/>
				</div>
			) }
		</>
	);
}
