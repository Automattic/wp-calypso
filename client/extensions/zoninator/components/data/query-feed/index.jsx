/**
 * External dependencies
 */

import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestFeed } from '../../../state/feeds/actions';

class QueryFeed extends PureComponent {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		zoneId: PropTypes.number.isRequired,
	};

	UNSAFE_componentWillMount() {
		this.requestFeed( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId && this.props.zoneId === nextProps.zoneId ) {
			return;
		}

		this.requestFeed( nextProps );
	}

	requestFeed = ( props ) => props.requestFeed( props.siteId, props.zoneId );

	render() {
		return null;
	}
}

const connectComponent = connect( null, { requestFeed } );

export default connectComponent( QueryFeed );
