import { CheckboxControl } from '@wordpress/components';
import clsx from 'clsx';
import * as React from 'react';

interface Props {
	label: string;
	checked: boolean;
	onToggle: () => void;
	children?: React.ReactNode;
}

const PurposeItem: React.FC< Props > = ( { label, checked, onToggle, children } ) => (
	<li
		className={ clsx( 'sensei-setup-wizard__purpose-item', {
			'sensei-setup-wizard__purpose-item--checked': checked,
		} ) }
	>
		<CheckboxControl
			className="sensei-setup-wizard__checkbox"
			label={ label }
			checked={ checked }
			onChange={ onToggle }
		/>

		{ checked && children && (
			<small className="sensei-setup-wizard__purpose-children">{ children }</small>
		) }
	</li>
);

export default PurposeItem;
