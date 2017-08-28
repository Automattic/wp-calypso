/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo';

const JetpackColophon = ( { className } ) => {
	return (
		<div className={ classNames( 'jetpack-colophon', className ) }>
			<span className="jetpack-colophon__power">Powered by </span><JetpackLogo size={ 24 } full />
		</div>
	);
};

export default JetpackColophon;
