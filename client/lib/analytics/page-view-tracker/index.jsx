/**
 * External dependencies
 */
import debugFactory from 'debug';
import { flowRight, noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordPageView } from 'state/analytics/actions';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:analytics:PageViewTracker' );

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
		debug( 'Component has mounted.' );
		this.queuePageView();
	}

	componentWillUnmount() {
		debug( 'Component has unmounted.' );
		clearTimeout( this.state.timer );
	}

	queuePageView = () => {
		const {
			delay = 0,
			path,
			recorder = noop,
			title
		} = this.props;

		debug( `Queuing Page View: "${ title }" at "${ path }" with ${ delay }ms delay` );

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
