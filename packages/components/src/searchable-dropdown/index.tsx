import { ComboboxControl, Disabled } from '@wordpress/components';
import clsx from 'clsx';

import './style.scss';

type Props = React.ComponentProps< typeof ComboboxControl > & {
	disabled?: boolean;
};

export function SearchableDropdown( props: Props ) {
	const { disabled = false } = props;

	return (
		<div
			className={ clsx( 'searchable-dropdown', {
				'is-disabled': disabled,
			} ) }
		>
			<Disabled isDisabled={ disabled }>
				<ComboboxControl { ...props } />
			</Disabled>
		</div>
	);
}

export default SearchableDropdown;
