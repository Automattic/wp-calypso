/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import flowRight from 'lodash/flowRight';
import noop from 'lodash/noop';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordPageView } from 'state/analytics/actions';

export const PageViewTracker = React.createClass( {
	getInitialState: () => ( {
		timer: null
	} ),

	componentDidMount() {
		this.queuePageView();
	},

	componentWillUnmount() {
		clearTimeout( this.state.timer );
	},

	queuePageView() {
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
	},

	render: () => null
} );

PageViewTracker.propTypes = {
	delay: PropTypes.number,
	path: PropTypes.string.isRequired,
	recorder: PropTypes.func,
	title: PropTypes.string.isRequired
};

const mapDispatchToProps = dispatch => ( {
	recorder: flowRight( dispatch, recordPageView )
} );

export default connect( null, mapDispatchToProps )( PageViewTracker );
