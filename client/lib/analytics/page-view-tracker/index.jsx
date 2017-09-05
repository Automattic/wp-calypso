/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { flowRight, noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordPageView } from 'state/analytics/actions';

export class PageViewTracker extends React.Component {
	static displayName = 'PageViewTracker';

	static propTypes = {
		delay: PropTypes.number,
		path: PropTypes.string.isRequired,
		recorder: PropTypes.func,
		title: PropTypes.string.isRequired
	};

	state = {
		timer: null
	};

	componentDidMount() {
		this.queuePageView();
	}

	componentWillUnmount() {
		clearTimeout( this.state.timer );
	}

	queuePageView = () => {
		const {
			delay = 0,
			path,
			recorder = noop,
			title
		} = this.props;

		if ( this.state.timer ) {
			return;
		}

		if ( ! delay ) {
			return recorder( path, title );
		}

		this.setState( {
			timer: setTimeout( () => recorder( path, title ), delay )
		} );
	};

	render() {
		return null;
	}
}

const mapDispatchToProps = dispatch => ( {
	recorder: flowRight( dispatch, recordPageView )
} );

export default connect( null, mapDispatchToProps )( PageViewTracker );
