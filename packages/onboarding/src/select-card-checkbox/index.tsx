import { CheckboxControl } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import classNames from 'classnames';
import './style.scss';

type SelectCardCheckboxProps< T > = {
	children: React.ReactNode;
	className?: string;
	onChange: ( checked: boolean, value: T ) => void;
	selected: boolean;
	value: T;
};

const SelectCardCheckbox = < T, >( {
	children,
	className,
	onChange,
	selected,
	value,
}: SelectCardCheckboxProps< T > ) => {
	const handleClick = ( evt: React.MouseEvent ) => {
		onChange( ! selected, value );
		evt.stopPropagation();
	};

	const instanceId = useInstanceId( CheckboxControl );
	const id = `select-card-checkbox-${ instanceId }`;

	return (
		<div
			className={ classNames( 'select-card-checkbox__container', className, { selected } ) }
			onClickCapture={ handleClick }
			role="presentation"
		>
			<CheckboxControl checked={ selected } id={ id } onChange={ () => undefined } />
			<label className="select-card-checkbox__label" htmlFor={ id }>
				{ children }
			</label>
		</div>
	);
};

export default SelectCardCheckbox;
