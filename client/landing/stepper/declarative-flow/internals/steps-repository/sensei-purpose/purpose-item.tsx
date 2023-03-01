import { CheckboxControl } from '@wordpress/components';
import classnames from 'classnames';
import * as React from 'react';

interface Props {
	label: string;
	checked: boolean;
	onToggle: () => void;
}

const PurposeItem: React.FC< Props > = ( { label, checked, onToggle, children } ) => (
	<li
		className={ classnames( 'sensei-setup-wizard__purpose-item', {
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
