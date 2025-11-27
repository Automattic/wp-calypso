import { CheckboxControl, __experimentalHStack as HStack, Spinner } from '@wordpress/components';
import clsx from 'clsx';
import { useId } from 'react';
import './style.scss';

type SelectCardCheckboxProps = {
	children: React.ReactNode;
	className?: string;
	checked?: boolean;
	disabled?: boolean;
	isBusy?: boolean;
	onChange: ( checked: boolean ) => void;
};

const SelectCardCheckboxV2 = ( {
	children,
	className,
	onChange,
	disabled = false,
	checked = false,
	isBusy = false,
}: SelectCardCheckboxProps ) => {
	const instanceId = useId();
	const id = `select-card-checkbox-v2-${ instanceId }`;

	return (
		<HStack
			spacing={ 2 }
			as="label"
			className={ clsx( 'select-card-checkbox-v2', className, { 'is-busy': isBusy } ) }
			htmlFor={ id }
			alignment="left"
			aria-checked={ checked }
			aria-labelledby={ `select-card-checkbox-v2-label-${ instanceId }` }
		>
			<HStack alignment="left" spacing={ 2 } as="span">
				<CheckboxControl
					__nextHasNoMarginBottom
					checked={ checked }
					id={ id }
					onChange={ onChange }
					disabled={ disabled || isBusy }
				/>
				<span id={ `select-card-checkbox-v2-label-${ instanceId }` }>{ children }</span>
			</HStack>
			{ isBusy && <Spinner /> }
		</HStack>
	);
};

export default SelectCardCheckboxV2;
