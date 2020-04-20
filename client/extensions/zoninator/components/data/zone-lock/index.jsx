/**
 * External dependencies
 */
import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import getRequest from 'state/selectors/get-request';
import { requestLock, resetLock } from '../../../state/locks/actions';
import { created, expires, maxLockPeriod } from '../../../state/locks/selectors';

class ZoneLock extends PureComponent {
	static propTypes = {
		created: PropTypes.number,
		expires: PropTypes.number,
		maxLockPeriod: PropTypes.number,
		request: PropTypes.shape( {
			isLoading: PropTypes.bool,
		} ),
		requestLock: PropTypes.func.isRequired,
		resetLock: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		zoneId: PropTypes.number.isRequired,
	};

	UNSAFE_componentWillMount() {
		this.resetLock( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId && this.props.zoneId === nextProps.zoneId ) {
			this.scheduleRefresh( nextProps );
			return;
		}

		this.resetLock( nextProps );
	}

	componentWillUnmount() {
		this._refresh && clearTimeout( this._refresh );
		this._refresh = null;
	}

	resetLock( props ) {
		this.requestLock( props );
		this.props.resetLock( props.siteId, props.zoneId );
	}

	requestLock( props ) {
		const { request, siteId, zoneId } = props;
		! request.isLoading && siteId && zoneId && props.requestLock( siteId, zoneId );
	}

	scheduleRefresh( props ) {
		if ( ! this.shouldRefresh( props ) ) {
			return;
		}

		// Request a refresh one second before the current lock expires
		this._refresh = setTimeout( () => {
			this._refresh = null;
			this.requestLock( props );
		}, props.expires - new Date().getTime() - 1000 );
	}

	shouldRefresh = ( props ) =>
		! this._refresh &&
		props.expires &&
		new Date().getTime() < props.expires &&
		props.expires < props.created + props.maxLockPeriod;

	render() {
		return null;
	}
}

const connectComponent = connect(
	( state, { siteId, zoneId } ) => ( {
		created: created( state, siteId, zoneId ),
		expires: expires( state, siteId, zoneId ),
		maxLockPeriod: maxLockPeriod( state, siteId, zoneId ),
		request: getRequest( state, requestLock( siteId, zoneId ) ),
	} ),
	{ requestLock, resetLock }
);

export default connectComponent( ZoneLock );
