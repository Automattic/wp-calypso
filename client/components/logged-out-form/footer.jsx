import { Card } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import './footer.scss';

export default function LoggedOutFormFooter( { className, isBlended, children } ) {
	return (
		<Card className={ clsx( 'logged-out-form__footer', className, { 'is-blended': isBlended } ) }>
			{ children }
		</Card>
	);
}

LoggedOutFormFooter.propTypes = {
	children: PropTypes.node.isRequired,
	className: PropTypes.string,
	isBlended: PropTypes.bool,
};
