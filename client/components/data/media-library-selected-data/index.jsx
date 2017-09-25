/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import passToChildren from 'lib/react-pass-to-children';

function getStateData( siteId ) {
	return {
		mediaLibrarySelectedItems: MediaLibrarySelectedStore.getAll( siteId )
	};
}

export default React.createClass( {
	displayName: 'MediaLibrarySelectedData',

	propTypes: {
		siteId: PropTypes.number.isRequired
	},

	getInitialState: function() {
		return getStateData( this.props.siteId );
	},

	componentDidMount: function() {
		MediaLibrarySelectedStore.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		MediaLibrarySelectedStore.off( 'change', this.updateState );
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
