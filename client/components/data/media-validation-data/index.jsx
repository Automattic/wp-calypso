/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Interanl dependencies
 */
import MediaValidationStore from 'lib/media/validation-store';
import passToChildren from 'lib/react-pass-to-children';

function getStateData( siteId ) {
	return {
		mediaValidationErrors: MediaValidationStore.getAllErrors( siteId ),
	};
}

export default class extends React.Component {
	static displayName = 'MediaValidationData';

	static propTypes = {
		siteId: PropTypes.number.isRequired,
	};

	state = getStateData( this.props.siteId );

	componentDidMount() {
		MediaValidationStore.on( 'change', this.updateState );
	}

	componentWillUnmount() {
		MediaValidationStore.off( 'change', this.updateState );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.setState( getStateData( nextProps.siteId ) );
		}
	}

	updateState = () => {
		this.setState( getStateData( this.props.siteId ) );
	};

	render() {
		return passToChildren( this, this.state );
	}
}
