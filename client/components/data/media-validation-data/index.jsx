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
		mediaValidationErrors: MediaValidationStore.getAllErrors( siteId )
	};
}

export default React.createClass( {
	displayName: 'MediaValidationData',

	propTypes: {
		siteId: PropTypes.number.isRequired
	},

	getInitialState: function() {
		return getStateData( this.props.siteId );
	},

	componentDidMount: function() {
		MediaValidationStore.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		MediaValidationStore.off( 'change', this.updateState );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.setState( getStateData( nextProps.siteId ) );
		}
	},

	updateState: function() {
		this.setState( getStateData( this.props.siteId ) );
	},

	render: function() {
		return passToChildren( this, this.state );
	}
} );
