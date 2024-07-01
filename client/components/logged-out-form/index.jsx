import { Card } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import './style.scss';

export default function LoggedOutForm( { className, ...props } ) {
	return (
		<Card className={ clsx( 'logged-out-form', className ) }>
			<form { ...props } />
		</Card>
	);
}

LoggedOutForm.propTypes = {
	children: PropTypes.node.isRequired,
	className: PropTypes.string,
};
