/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { sample } from 'lodash';

const bannerCache = {};

const isClient = () => {
	return !! global.window;
};

class RandomThemesBanner extends PureComponent {
	static propTypes = {
		context: PropTypes.string.isRequired,
		banners: PropTypes.array.isRequired,
	};

	constructor( props ) {
		super( props );
		const { context, banners } = props;
		if ( ! bannerCache.hasOwnProperty( context ) ) {
			bannerCache[ context ] = sample( banners );
		}
	}

	render() {
		// Client-side.
		if ( isClient() ) {
			const { context } = this.props;
			const BannerComponent = bannerCache[ context ];
			return <BannerComponent />;
		}

		// Server-side.
		return null;
	}
}

export default RandomThemesBanner;
