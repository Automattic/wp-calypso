/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSiteData from '../site-data';

function getWcApiState( state ) {
	return get( state, 'extensions.woocommerce.wcApi', {} );
}

export function withWooCommerceSite( mapSiteDataToProps ) {
	return function connectWithWooCommerceSite( WrappedComponent ) {
		let lastWcApiSite = null;
		let lastWcApiState = null;
		let siteData = null;

		function getSiteData( wcApiSite, state ) {
			const wcApiState = getWcApiState( state );

			if ( wcApiSite !== lastWcApiSite || wcApiState !== lastWcApiState ) {
				lastWcApiSite = wcApiSite;
				lastWcApiState = wcApiState;
				siteData = createSiteData( wcApiSite, wcApiState );
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
		component.shouldComponentUpdate = ( nextProps, nextState ) => {
			const { wcApiSite } = nextProps;
			const wcApiState = getWcApiState( nextState );
			const ret = wcApiSite !== lastWcApiState || wcApiState !== lastWcApiState;
			return ret;
		};

		return component;
	};
}

export default withWooCommerceSite;
