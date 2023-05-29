import { ComboboxControl, Disabled } from '@wordpress/components';
import classNames from 'classnames';

import './style.scss';

type Props = ComboboxControl.Props & {
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
			<Disabled
				// TODO: The type definition for Disabled is incorrect, isDisabled actually exists. Upgrading the @wordpress/components
				// which the latest version now ships with its own type definitions which fixes the issue.
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				isDisabled={ disabled }
			>
				<ComboboxControl { ...props } />
			</Disabled>
		</div>
	);
}
