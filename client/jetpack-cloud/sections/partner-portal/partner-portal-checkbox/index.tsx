import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { ReactElement } from 'react';
import './style.scss';

interface Props {
	isChecked: boolean;
}

export default function PartnerPortalCheckbox( props: Props ): ReactElement {
	const { isChecked } = props;

	const classes = classNames( {
		'partner-portal-checkbox': true,
		'is-checked': isChecked,
	} );

	return <div className={ classes }>{ isChecked && <Gridicon icon="checkmark" /> }</div>;
}
