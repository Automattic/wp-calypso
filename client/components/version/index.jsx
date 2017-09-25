/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class Version extends Component {
	static displayName = 'Version';

	static propTypes = {
		version: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.number,
		] ).isRequired,
		icon: PropTypes.string
	};

	renderIcon = () => {
		return this.props.icon
			? <Gridicon icon={ this.props.icon } size={ 18 } />
			: null;
	};

	render() {
		return this.props.version
			? <div className="version">
				{ this.renderIcon() }
				{ this.props.translate( 'Version %s', { args: this.props.version } ) }
			</div>
			: null;
	}
}

export default localize( Version );
