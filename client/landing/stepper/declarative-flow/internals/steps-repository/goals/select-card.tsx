import { CheckboxControl } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import classNames from 'classnames';

type SelectCardProps< T > = {
	children: React.ReactNode;
	className?: string;
	onChange: ( checked: boolean, value: T ) => void;
	selected: boolean;
	value: T;
};

const SelectCard = < T, >( {
	children,
	className,
	onChange,
	selected,
	value,
}: SelectCardProps< T > ) => {
	const handleClick = ( evt: React.MouseEvent ) => {
		onChange( ! selected, value );
		evt.stopPropagation();
	};

	const instanceId = useInstanceId( CheckboxControl );
	const id = `select-card-checkbox-${ instanceId }`;

	return (
		<div
			className={ classNames( 'select-card__container', className, { selected } ) }
			onClickCapture={ handleClick }
			role="presentation"
		>
			<CheckboxControl checked={ selected } id={ id } onChange={ () => undefined } />
			<label className="select-card__label" htmlFor={ id }>
				{ children }
			</label>
		</div>
	);
};

export default SelectCard;
