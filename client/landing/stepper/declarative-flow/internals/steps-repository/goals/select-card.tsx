import { CheckboxControl } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import classNames from 'classnames';

type SelectCardProps = {
	children: React.ReactNode;
	className?: string;
	onChange: ( checked: boolean, value: string ) => void;
	selected: boolean;
	value: string;
};

const SelectCard: React.FC< SelectCardProps > = ( {
	children,
	className,
	onChange,
	selected,
	value,
} ) => {
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
