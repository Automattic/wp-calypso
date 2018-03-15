/** @format */

/**
 * External dependencies
 */

import debugFactory from 'debug';
import PropTypes from 'prop-types';
import React from 'react';
import { flowRight, noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordPageView } from 'state/analytics/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { hasLoadedSites } from 'state/selectors';

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
		selectedSiteId: PropTypes.number,
		sitesLoaded: PropTypes.bool,
		title: PropTypes.string.isRequired,
	};

	state = {
		timer: null,
	};

	componentDidMount() {
		debug( 'Component has mounted.' );
		this.queuePageView();
	}

	componentWillUnmount() {
		debug( 'Component has unmounted.' );
		clearTimeout( this.state.timer );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.selectedSiteId !== nextProps.selectedSiteId ) {
			this.queuePageView();
		}
	}

	queuePageView = () => {
		const { delay = 0, path, recorder = noop, sitesLoaded, title } = this.props;

		debug( `Queuing Page View: "${ title }" at "${ path }" with ${ delay }ms delay` );

		if ( ! sitesLoaded || this.state.timer ) {
			return;
		}

		if ( ! delay ) {
			return recorder( path, title );
		}

		this.setState( {
			timer: setTimeout( () => recorder( path, title ), delay ),
		} );
	};

	render() {
		return null;
	}
}

const mapStateToProps = state => ( {
	selectedSiteId: getSelectedSiteId( state ),
	sitesLoaded: hasLoadedSites( state ),
} );

const mapDispatchToProps = dispatch => ( {
	recorder: flowRight( dispatch, recordPageView ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( PageViewTracker );
