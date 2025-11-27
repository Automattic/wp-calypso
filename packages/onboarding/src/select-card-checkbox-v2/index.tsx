import { CheckboxControl, __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';
import { useId } from 'react';
import './style.scss';

type SelectCardCheckboxProps = {
	children: React.ReactNode;
	className?: string;
	checked?: boolean;
	disabled?: boolean;
	onChange: ( checked: boolean ) => void;
};

const SelectCardCheckboxV2 = ( {
	children,
	className,
	onChange,
	disabled = false,
	checked = false,
}: SelectCardCheckboxProps ) => {
	const instanceId = useId();
	const id = `select-card-checkbox-v2-${ instanceId }`;

	return (
		<HStack
			spacing={ 2 }
			as="label"
			className={ clsx( 'select-card-checkbox-v2', className ) }
			htmlFor={ id }
			alignment="left"
			aria-checked={ checked }
			aria-labelledby={ `select-card-checkbox-v2-label-${ instanceId }` }
		>
			<CheckboxControl
				__nextHasNoMarginBottom
				checked={ checked }
				id={ id }
				onChange={ onChange }
				disabled={ disabled }
			/>
			<span id={ `select-card-checkbox-v2-label-${ instanceId }` }>{ children }</span>
		</HStack>
	);
};

export default SelectCardCheckboxV2;
