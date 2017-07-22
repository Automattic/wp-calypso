/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { periodicActionSubscribe, periodicActionUnSubscribe } from 'state/periodic-actions/actions';

class PeriodicActionHandler extends Component {
	static propTypes = {
		periodicActionId: PropTypes.string.isRequired,
		actionToExecute: PropTypes.oneOfType( [
			PropTypes.func,
			PropTypes.object,
		] ).isRequired,
		interval: PropTypes.number,
		skipChecker: PropTypes.func,
		pauseWhenHidden: PropTypes.bool,
		executeOnStart: PropTypes.bool,
	};

	static defaultProps = {
		interval: 30000,
		skipChecker: null,
		pauseWhenHidden: true,
		executeOnStart: true
	};

	componentWillMount() {
		this.subscribe( this.props );
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.periodicActionId !== this.props.periodicActionId ||
			nextProps.interval !== this.props.interval ||
			nextProps.pauseWhenHidden !== this.props.pauseWhenHidden ) {
			this.unsubscribe();
			this.subscribe( nextProps );
		}
	}

	subscribe( { periodicActionId, actionToExecute, interval, skipChecker, pauseWhenHidden, executeOnStart } ) {
		this.props.periodicActionSubscribe( periodicActionId, actionToExecute, interval, skipChecker, pauseWhenHidden, executeOnStart );
	}

	unsubscribe() {
		this.props.periodicActionUnSubscribe( this.props.periodicActionId );
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	{
		periodicActionSubscribe,
		periodicActionUnSubscribe,
	}
)( PeriodicActionHandler );
