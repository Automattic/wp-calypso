import clsx from 'clsx';
import { useId, type FC, type ReactNode, ReactElement, useCallback } from 'react';
import './style.scss';

interface Option {
	label: ReactNode;
	description?: ReactNode;
	value: string;
	selected?: boolean;
}

interface SelectCardRadioProps {
	option: Option;
	onChange: ( value: Option[ 'value' ] ) => void;
	name: string;
	className?: string;
}

export const SelectCardRadio: FC< SelectCardRadioProps > = ( {
	option,
	onChange,
	name,
	className,
} ) => {
	const id = useId();

	const handleChange = useCallback(
		( event: React.ChangeEvent< HTMLInputElement > ) => {
			onChange?.( event.target.value );
		},
		[ onChange ]
	);

	return (
		<label
			htmlFor={ `${ id }-radio` }
			aria-labelledby={ `${ id }-info` }
			className={ clsx( 'select-card-radio', className ) }
		>
			<input
				type="radio"
				className="select-card-radio__input"
				id={ `${ id }-radio` }
				value={ option.value }
				defaultChecked={ option.selected }
				onChange={ handleChange }
				name={ name }
			/>
			<div className="select-card-radio__info" id={ `${ id }-info` }>
				<span>{ option.label }</span>
				<span className="select-card-radio__description">{ option.description }</span>
			</div>
		</label>
	);
};

interface SelectCardRadioListProps {
	className?: string;
	children: ReactElement< typeof SelectCardRadio > | ReactElement< typeof SelectCardRadio >[];
}

export const SelectCardRadioList: FC< SelectCardRadioListProps > = ( { children, className } ) => {
	return <div className={ clsx( 'select-card-radio__list', className ) }>{ children }</div>;
};
