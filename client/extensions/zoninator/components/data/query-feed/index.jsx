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
		siteId: PropTypes.number,
		zoneId: PropTypes.number,
	};

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

		if (
			! siteId ||
			! zoneId ||
			siteId === this.state.siteId ||
			zoneId === this.state.zoneId
		) {
			return;
		}

		props.requestFeed( siteId, zoneId );
	}

	render() {
		return null;
	}
}

const connectComponent = connect(
	null,
	{ requestFeed },
);

export default connectComponent( QueryFeed );
