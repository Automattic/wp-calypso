/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestFeed } from '../../../state/feeds/actions';

class QueryFeed extends Component {

	static propTypes = {
		siteId: PropTypes.number,
		zoneId: PropTypes.number,
	};

	state = {
		siteId: -1,
		zoneId: -1,
	}

	componentWillMount() {
		this.requestFeed( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.siteId || ! nextProps.zoneId ) {
			return;
		}

		this.requestFeed( nextProps );
	}

	requestFeed( props ) {
		const { siteId, zoneId } = props;

		if ( siteId === this.state.siteId || zoneId === this.state.zoneId ) {
			return;
		}

		props.requestFeed( siteId, zoneId );

		this.setState( () => ( {
			siteId,
			zoneId,
		} ) );
	}

	render() {
		return null;
	}
}

const connectComponent = connect(
	() => ( {} ),
	{ requestFeed }
);

export default connectComponent( QueryFeed );
