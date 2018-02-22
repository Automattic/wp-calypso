/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { sample } from 'lodash';

const isClient = () => {
	return !! global.window;
};

class RandomThemesBanner extends PureComponent {
	static propTypes = {
		banners: PropTypes.array.isRequired,
	};

	constructor( props ) {
		super( props );
		const { banners } = props;
		this.state = {
			BannerComponent: sample( banners ),
		};
	}

	render() {
		// Client-side.
		if ( isClient() ) {
			const { BannerComponent } = this.state;
			return <BannerComponent />;
		}

		// Server-side.
		return null;
	}
}

export default RandomThemesBanner;
