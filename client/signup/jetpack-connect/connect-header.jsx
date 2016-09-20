/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import StepHeader from '../step-header';

const JetpackConnectHeader = ( props ) => {
	return (
		<div className="jetpack-connect__header-container">
			{ props.showLogo
				? (
					<img
						className="jetpack-connect__jetpack-logo"
						src="/calypso/images/jetpack/jetpack-logo.svg"
						width={ 18 }
						height={ 18 }
					/>
				)
				: null
			}
			<StepHeader { ...props } />
		</div>
	);
};

JetpackConnectHeader.propTypes = {
	showLogo: PropTypes.bool,
	label: PropTypes.string
};

JetpackConnectHeader.defaultProps = {
	showLogo: true,
	label: ''
};

export default JetpackConnectHeader;
