/**
 * External dependencies
 */

import debugFactory from 'debug';
import PropTypes from 'prop-types';
import React from 'react';
import { get, isNumber, noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSiteFragment } from 'lib/route';
import {
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteType,
} from 'state/analytics/actions';
import { withEnhancers } from 'state/utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';

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
		hasSelectedSiteLoaded: PropTypes.bool,
		selectedSiteId: PropTypes.number,
		title: PropTypes.string.isRequired,
		properties: PropTypes.object,
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

	componentDidUpdate( prevProps ) {
		if (
			prevProps.path !== this.props.path ||
			prevProps.selectedSiteId !== this.props.selectedSiteId
		) {
			this.queuePageView();
		}
	}

	queuePageView = () => {
		const {
			delay = 0,
			path,
			recorder = noop,
			hasSelectedSiteLoaded,
			title,
			properties,
		} = this.props;

		debug( `Queuing Page View: "${ title }" at "${ path }" with ${ delay }ms delay` );

		if ( ! hasSelectedSiteLoaded || this.state.timer ) {
			return;
		}

		if ( ! delay ) {
			return recorder( path, title, 'default', properties );
		}

		this.setState( {
			timer: setTimeout( () => recorder( path, title ), delay ),
		} );
	};

	render() {
		return null;
	}
}

const mapStateToProps = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const selectedSiteSlug = getSiteSlug( state, selectedSiteId );
	const currentSlug =
		typeof window === 'undefined' ? '' : getSiteFragment( get( window, 'location.pathname', '' ) );

	const hasSelectedSiteLoaded =
		! currentSlug ||
		( isNumber( currentSlug ) && currentSlug === selectedSiteId ) ||
		currentSlug === selectedSiteSlug;

	return {
		hasSelectedSiteLoaded,
		selectedSiteId,
	};
};

const mapDispatchToProps = {
	recorder: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
};

export default connect( mapStateToProps, mapDispatchToProps )( PageViewTracker );
