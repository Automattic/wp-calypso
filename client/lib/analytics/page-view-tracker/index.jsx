import debugFactory from 'debug';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { getSiteFragment } from 'calypso/lib/route';
import {
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteMainProduct,
	enhanceWithSiteType,
	enhanceWithUserIsDevAccount,
	enhanceWithGlobalSiteViewEnabled,
} from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { withEnhancers } from 'calypso/state/utils';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:analytics:PageViewTracker' );
const noop = () => {};

export class UnconnectedPageViewTracker extends Component {
	static displayName = 'PageViewTracker';

	static propTypes = {
		delay: PropTypes.number,
		path: PropTypes.string.isRequired,
		recorder: PropTypes.func,
		hasSelectedSiteLoaded: PropTypes.bool,
		selectedSiteId: PropTypes.number,
		title: PropTypes.string.isRequired,
		properties: PropTypes.object,
		options: PropTypes.object,
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
			isUserAuthenticated,
			title,
		} = this.props;

		debug( `Queuing Page View: "${ title }" at "${ path }" with ${ delay }ms delay` );

		// When the user is not authenticated, their site data isn't requested and we still want
		// to record the page view.
		if ( ( ! hasSelectedSiteLoaded && isUserAuthenticated ) || this.state.timer ) {
			return;
		}

		if ( ! delay ) {
			return this.recordViewWithProperties();
		}

		this.setState( {
			timer: setTimeout( () => recorder( path, title ), delay ),
		} );
	};

	recordViewWithProperties() {
		const { path, recorder = noop, title, properties, options } = this.props;

		return recorder( path, title, 'default', properties, options );
	}

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
		( typeof currentSlug === 'number' && currentSlug === selectedSiteId ) ||
		currentSlug === selectedSiteSlug;

	return {
		hasSelectedSiteLoaded,
		selectedSiteId,
		isUserAuthenticated: getCurrentUserId( state ),
	};
};

const mapDispatchToProps = {
	recorder: withEnhancers( recordPageView, [
		enhanceWithSiteType,
		enhanceWithSiteMainProduct,
		enhanceWithUserIsDevAccount,
		enhanceWithGlobalSiteViewEnabled,
	] ),
};

export default connect( mapStateToProps, mapDispatchToProps )( UnconnectedPageViewTracker );
