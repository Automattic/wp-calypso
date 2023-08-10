import { ComboboxControl, Disabled } from '@wordpress/components';
import classNames from 'classnames';

import './style.scss';

type Props = React.ComponentProps< typeof ComboboxControl > & {
	disabled?: boolean;
};

export default function SearchableDropdown( props: Props ) {
	const { disabled } = props;

	return (
		<div
			className={ classNames( 'searchable-dropdown', {
				'is-disabled': disabled,
			} ) }
		>
			<Disabled isDisabled={ disabled }>
				<ComboboxControl { ...props } />
			</Disabled>
		</div>
	);
}
