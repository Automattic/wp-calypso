import { formatNumber } from '@automattic/number-formatters';
import { __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';

import './style.scss';

export interface FilterPill< T extends string > {
	value: T;
	label: string;
	/** Shown after the label, such as how many items the filter matches. */
	count?: number;
}

/** A row of toggle buttons for narrowing a short list, one selected at a time. */
export default function FilterPills< T extends string >( {
	label,
	options,
	value,
	onChange,
}: {
	/** The accessible name of the group of pills. */
	label: string;
	options: FilterPill< T >[];
	value: T;
	onChange: ( value: T ) => void;
} ) {
	return (
		<HStack
			spacing={ 2 }
			justify="flex-start"
			wrap
			role="group"
			aria-label={ label }
			className="a4a-filter-pills"
		>
			{ options.map( ( option ) => {
				const isSelected = option.value === value;
				return (
					<button
						key={ option.value }
						type="button"
						className={ clsx( 'a4a-filter-pill', { 'is-selected': isSelected } ) }
						aria-pressed={ isSelected }
						onClick={ () => onChange( option.value ) }
					>
						<span className="a4a-filter-pill__label">{ option.label }</span>
						{ option.count !== undefined && (
							<span className="a4a-filter-pill__count">{ formatNumber( option.count ) }</span>
						) }
					</button>
				);
			} ) }
		</HStack>
	);
}
