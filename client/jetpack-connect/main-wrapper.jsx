/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo';
import Main from 'components/main';
import { isEnabled } from 'config';
import { retrieveMobileRedirect } from './persistence-utils';

const JetpackConnectMainWrapper = ( { isWide, className, children } ) => {
	const jetpackBranded = isEnabled( 'jetpack/connection-rebranding' );
	const wrapperClassName = classNames( 'jetpack-connect__main', {
		'is-wide': isWide,
		'is-mobile-app-flow': !! retrieveMobileRedirect(),
		'jetpack-branded': jetpackBranded,
	} );
	return (
		<Main className={ classNames( className, wrapperClassName ) }>
			{ jetpackBranded && (
				<div className="jetpack-connect__main-logo">
					<JetpackLogo full size={ 100 /* @todo get real size from designs */ } />
				</div>
			) }
			{ children }
		</Main>
	);
};

JetpackConnectMainWrapper.propTypes = {
	isWide: PropTypes.bool,
};

JetpackConnectMainWrapper.defaultProps = {
	isWide: false,
};

export default JetpackConnectMainWrapper;
