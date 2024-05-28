import classNames from 'classnames';
import PropTypes from 'prop-types';
import JetpackLogo from 'calypso/components/jetpack-logo';

import './style.scss';

function JetpackHeader( { className } ) {
	const classes = classNames( 'jetpack-header', className );

	return (
		<header className={ classes }>
			<JetpackLogo size={ 32 } full />
		</header>
	);
}

JetpackHeader.propTypes = {
	className: PropTypes.string,
};

export default JetpackHeader;
