import { PremiumBadge } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import clsx from 'clsx';
import { Question, Option } from '../types';

type SurveyCheckboxOptionProps = {
	question: Question;
	option: Option;
	onChange: ( key: string, value: string[] ) => void;
	value: string[];
	disabled?: boolean;
};

const SurveyCheckboxOption = ( {
	question,
	option,
	onChange,
	value,
	disabled,
}: SurveyCheckboxOptionProps ) => {
	const isSelected = value.includes( option.value );
	const handleToggle = () => {
		const newValue = isSelected
			? value.filter( ( v ) => v !== option.value )
			: [ ...value, option.value ];

		onChange( question.key, newValue );
	};

	const handleKeyDown = ( event: React.KeyboardEvent< HTMLDivElement > ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			handleToggle();
		}
	};

	return (
		<div
			className={ clsx( 'question-options__option-control', {
				checked: isSelected,
				disabled,
			} ) }
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
				disabled={ disabled }
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
			{ option?.additionalProps?.is_premium && <PremiumBadge shouldHideTooltip /> }
		</div>
	);
};

export default SurveyCheckboxOption;
