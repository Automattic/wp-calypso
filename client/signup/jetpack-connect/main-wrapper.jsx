/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Main from 'components/main';

const JetpackConnectMainWrapper = ( { isWide, className, children } ) => {
	const wrapperClassName = classNames( 'jetpack-connect__main', {
		'is-wide': isWide
	} );
	return (
		<Main className={ classNames( className, wrapperClassName ) }>
			{ children }
		</Main>
	);
};

JetpackConnectMainWrapper.propTypes = {
	isWide: React.PropTypes.bool
};

JetpackConnectMainWrapper.defaultProps = {
	isWide: false
};

export default JetpackConnectMainWrapper;
