import clsx from 'clsx';
import { useCallback } from 'react';
import { Question, Option } from '../types';

type SurveyRadioOptionProps = {
	question: Question;
	option: Option;
	onChange: ( key: string, value: string[] ) => void;
	value: string[];
	disabled?: boolean;
};

const SurveyRadioOption = ( {
	question,
	option,
	onChange,
	value,
	disabled,
}: SurveyRadioOptionProps ) => {
	const isSelected = value.includes( option.value );

	const handleKeyDown = useCallback(
		( event: React.KeyboardEvent< HTMLDivElement > ) => {
			if ( event.key === 'Enter' || event.key === ' ' ) {
				onChange( question.key, [ option.value ] );
			}
		},
		[ onChange, question.key, option.value ]
	);

	const handleClick = useCallback( () => {
		onChange( question.key, [ option.value ] );
	}, [ onChange, question.key, option.value ] );

	return (
		<div
			className={ clsx( 'question-options__option-control', {
				checked: isSelected,
				disabled,
			} ) }
			role="radio"
			tabIndex={ 0 }
			onClick={ handleClick }
			onKeyDown={ handleKeyDown }
			aria-checked={ isSelected ? 'true' : 'false' }
			aria-labelledby={ `option-label-${ option.value } option-help-text-${ option.value }` }
		>
			<input
				type="radio"
				id={ `option-${ option.value }` }
				name={ question.key }
				value={ option.value }
				onChange={ handleClick }
				checked={ isSelected }
				className="form-radio"
				tabIndex={ -1 }
				aria-hidden="true"
				disabled={ disabled }
			/>

			<div className="question-options__option-label">
				<label id={ `option-label-${ option.value }` } htmlFor={ `option-${ option.value }` }>
					{ option.label }
				</label>
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

export default SurveyRadioOption;
