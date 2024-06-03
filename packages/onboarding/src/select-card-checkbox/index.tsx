import { CheckboxControl } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import clsx from 'clsx';
import './style.scss';

type SelectCardCheckboxProps = {
	children: React.ReactNode;
	className?: string;
	onChange: ( checked: boolean ) => void;
	checked: boolean;
};

const SelectCardCheckbox = ( {
	children,
	className,
	onChange,
	checked,
}: SelectCardCheckboxProps ) => {
	const instanceId = useInstanceId( CheckboxControl );
	const id = `select-card-checkbox-${ instanceId }`;

	return (
		<div
			className={ clsx( 'select-card-checkbox__container', className, {
				'is-checked': checked,
			} ) }
			onClick={ () => onChange( ! checked ) }
			role="presentation"
		>
			<CheckboxControl checked={ checked } id={ id } onChange={ onChange } />
			<label className="select-card-checkbox__label" htmlFor={ id }>
				{ children }
			</label>
		</div>
	);
};

export default SelectCardCheckbox;
