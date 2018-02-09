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

export function withWooCommerceSite( mapSiteDataToProps ) {
	return function connectWithWooCommerceSite( WrappedComponent ) {
		let lastWcApiSite = null;
		let lastWcApiState = null;
		let siteData = null;

		function getSiteData( wcApiSite, state ) {
			const wcApiState = get( state, 'extensions.woocommerce.wcApi', {} );

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

		return component;
	};
}

export default withWooCommerceSite;
