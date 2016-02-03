import React, { PropTypes } from 'react';

import StepHeader from '../step-header';

export default React.createClass( {
	displayName: 'JetpackConnectHeader',

	propTypes: {
		showLogo: PropTypes.bool,
		label: PropTypes.string
	},

	getDefaultProps() {
		return {
			showLogo: true,
			label: ''
		}
	},

	renderJetpackLogo() {
		return (
			<img
				className="jetpack-logo"
				src="/calypso/images/jetpack/jetpack-logo.svg"
				width={ 18 }
				height={ 18 } />
		);
	},

	render() {
		return (
			<div className="jetpack-connect__header-container">
				{ this.props.showLogo
					? this.renderJetpackLogo()
					: null }
				<StepHeader { ...this.props } />
			</div>
		);
	}
} );
