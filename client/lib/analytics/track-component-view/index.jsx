/**
 * External dependencies
 */
import { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';

class TrackComponentView extends Component {
	static propTypes = {
		eventName: PropTypes.string,
		eventProperties: PropTypes.object,
		recordTracksEvent: PropTypes.func
	};

	static defaultProps = {
		eventName: null,
		eventProperties: {},
		recordTracksEvent: () => {}
	};

	componentWillMount() {
		if ( this.props.eventName ) {
			this.props.recordTracksEvent( this.props.eventName, this.props.eventProperties );
		}
	}

	render() {
		return null;
	}

}

export default connect(
	null,
	{ recordTracksEvent }
)( TrackComponentView );

