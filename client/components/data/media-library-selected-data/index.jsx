/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import passToChildren from 'lib/react-pass-to-children';

function getStateData( siteId ) {
	return {
		mediaLibrarySelectedItems: MediaLibrarySelectedStore.getAll( siteId ),
	};
}

export default class extends React.Component {
	static displayName = 'MediaLibrarySelectedData';

	static propTypes = {
		siteId: PropTypes.number.isRequired,
	};

	state = getStateData( this.props.siteId );

	componentDidMount() {
		MediaLibrarySelectedStore.on( 'change', this.updateState );
	}

	componentWillUnmount() {
		MediaLibrarySelectedStore.off( 'change', this.updateState );
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
