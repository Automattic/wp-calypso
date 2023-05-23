import { ComboboxControl, Disabled } from '@wordpress/components';
import classNames from 'classnames';

import './style.scss';

type Props = ComboboxControl.Props & {
	disabled?: boolean;
	loading?: boolean;
};

export default function SearchableDropdown( props: Props ) {
	const { disabled, loading } = props;

	return (
		<div
			className={ classNames( 'searchable-dropdown', {
				'is-loading': loading,
				'is-disabled': disabled,
			} ) }
		>
			{ ! disabled && <ComboboxControl { ...props } /> }

			{ disabled && (
				<Disabled>
					<ComboboxControl { ...props } />
				</Disabled>
			) }
		</div>
	);
}
