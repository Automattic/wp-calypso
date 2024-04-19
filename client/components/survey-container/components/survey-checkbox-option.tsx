import { CheckboxControl } from '@wordpress/components';
import { useCallback } from 'react';
import { Question, Option } from '../types';

type SurveyCheckboxOptionType = {
	question: Question;
	option: Option;
	onChange: ( key: string, value: string[] ) => void;
	value: string[];
};

const SurveyCheckboxOption = ( {
	question,
	option,
	onChange,
	value,
}: SurveyCheckboxOptionType ) => {
	const isSelected = value.includes( option.value );
	const handleToggle = useCallback( () => {
		const newValue = isSelected
			? value.filter( ( v ) => v !== option.value )
			: [ ...value, option.value ];

		onChange( question.key, newValue );
	}, [ isSelected, value, option.value, onChange, question.key ] );

	const handleKeyDown = useCallback(
		( event: React.KeyboardEvent< HTMLDivElement > ) => {
			if ( event.key === 'Enter' || event.key === ' ' ) {
				handleToggle();
			}
		},
		[ handleToggle ]
	);

	return (
		<div
			className={ `question-options__option-control ${ isSelected ? 'checked' : '' }` }
			role="checkbox"
			onClick={ handleToggle }
			onKeyDown={ handleKeyDown }
			tabIndex={ 0 }
			aria-checked={ isSelected ? 'true' : 'false' }
			aria-labelledby={ `option-label-${ option.value } option-help-text-${ option.value }` }
		>
			<CheckboxControl
				id={ `option-${ option.value }` }
				name={ question.key }
				value={ option.value }
				checked={ isSelected }
				onChange={ handleToggle }
				tabIndex={ -1 }
				aria-hidden="true"
				onClick={ ( e ) => e.stopPropagation() }
			/>

			<div className="question-options__option-label">
				<label id={ `option-label-${ option.value }` }>{ option.label }</label>
				{ option.helpText && (
					<span
						id={ `option-help-text-${ option.value }` }
						className="question-options__option-help-text"
					>
						{ option.helpText }
					</span>
				) }
			</div>
		</div>
	);
};

export default SurveyCheckboxOption;
