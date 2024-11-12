import { TextareaControl, TextControl, SelectControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { toSelectOption } from '../to-select-options';

interface Props {
	isPlan: boolean;
	adventureOptions: string[];
	onChangeText?: ( text: string ) => void;
	onSelectNextAdventure?: ( nextAdventure: string ) => void;
	onChangeNextAdventureDetails?: ( details: string ) => void;
}

export default function NextAdventureStep( props: Props ) {
	const translate = useTranslate();
	const [ text, setText ] = useState( '' );
	const [ nextAdventure, setNextAdventure ] = useState( '' );
	const [ nextAdventureDetails, setNextAdventureDetails ] = useState( '' );

	const allOptions = [
		{
			value: '', // placeholder
			label: translate( 'Select an answer' ),
		},
		{
			value: 'stayingHere',
			label: translate( "I'm staying here and using the free plan." ),
		},
		{
			value: 'otherWordPress',
			label: translate( "I'm going to use WordPress somewhere else." ),
			textPlaceholder: translate( 'Mind telling us where?' ),
		},
		{
			value: 'differentService',
			label: translate( "I'm going to use a different service for my website or blog." ),
			textPlaceholder: translate( 'Mind telling us which one?' ),
		},
		{
			value: 'noNeed',
			label: translate( 'I no longer need a website or blog.' ),
			textPlaceholder: translate( 'What will you do instead?' ),
		},
		{
			value: 'otherPlugin',
			label: translate( 'I found a better plugin or service.' ),
			textPlaceholder: translate( 'Mind telling us which one(s)?' ),
		},
		{
			value: 'leavingWP',
			label: translate( "I'm moving my site off of WordPress." ),
			textPlaceholder: translate( 'Any particular reason(s)?' ),
		},
		{
			value: 'anotherReasonTwo',
			label: translate( 'Another reason…' ),
			textPlaceholder: translate( 'Can you please specify?' ),
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
		<div className="cancel-purchase-form__feedback">
			<FormattedHeader
				brandFont
				headerText={ translate( 'Sorry to see you go' ) }
				subHeaderText={ translate( 'One last thing', {
					context: 'This is the last step before cancelling the plan.',
				} ) }
			/>
			<div className="cancel-purchase-form__feedback-questions">
				<div className="cancel-purchase-form__feedback-question">
					<TextareaControl
						label={ translate( "What's one thing we could have done better?" ) }
						value={ text }
						onChange={ ( value: string ) => {
							setText( value );
							props.onChangeText?.( value );
						} }
						placeholder={ translate( 'Optional' ) }
						name="improvementInput"
						id="improvementInput"
					/>
				</div>
				{ props.isPlan && (
					<div className="cancel-purchase-form__feedback-question">
						<SelectControl
							label={ translate( 'Where is your next adventure taking you?' ) }
							value={ nextAdventure }
							options={ options }
							onChange={ ( value: string ) => {
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
			</div>
		</div>
	);
}
