/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';

/**
 * Internal dependencies
 */
import createSiteData from '../site-data';

export function withWooCommerceSite( mapSiteDataToProps ) {
	return function connectWithWooCommerceSite( WrappedComponent ) {
		let lastWcApiSite = null;
		let lastState = null;
		let siteData = null;

		function getSiteData( wcApiSite, state ) {
			// TODO: Replace `lastState` with site-specific state tree.
			//
			// This will help performance by not re-creating siteData unless
			// actual wc-api data has changed.
			//
			// Prerequisites for this to happen:
			//   1. Update all site selectors to take relative state tree instead of global.
			//   2. Move site state under `wc-api` state context.
			//
			if ( wcApiSite !== lastWcApiSite || state !== lastState ) {
				lastWcApiSite = wcApiSite;
				lastState = state;
				siteData = createSiteData( wcApiSite, state );
			}
			return siteData;
		}

		function mapStateToProps( state, ownProps ) {
			const { wcApiSite } = ownProps;
			return mapSiteDataToProps( getSiteData( wcApiSite, state ), ownProps, state );
		}

		const component = connect( mapStateToProps )( WrappedComponent );
		component.propTypes = {
			wcApiSite: PropTypes.number,
		};

		return component;
	};
}

export default withWooCommerceSite;
