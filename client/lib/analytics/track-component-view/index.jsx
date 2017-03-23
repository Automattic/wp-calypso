/**
 * External dependencies
 */
import { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { bumpStat, recordTracksEvent } from 'state/analytics/actions';

class TrackComponentView extends Component {
    static propTypes = {
        eventName: PropTypes.string,
        eventProperties: PropTypes.object,
        recordTracksEvent: PropTypes.func,
        bumpStat: PropTypes.func,
    };

    static defaultProps = {
        recordTracksEvent: () => {},
        bumpStat: () => {},
    };

    componentWillMount() {
        const { eventName, eventProperties } = this.props;
        if (eventName) {
            this.props.recordTracksEvent(eventName, eventProperties);
        }

        const { statGroup, statName } = this.props;
        if (statGroup) {
            this.props.bumpStat(statGroup, statName);
        }
    }

    render() {
        return null;
    }
}

export default connect(null, { bumpStat, recordTracksEvent })(TrackComponentView);
