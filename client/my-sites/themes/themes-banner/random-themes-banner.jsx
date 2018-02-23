/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { sample } from 'lodash';

class RandomThemesBanner extends PureComponent {
	static propTypes = {
		banners: PropTypes.array.isRequired,
	};

	state = {
		isClient: false,
	};

	componentDidMount() {
		// Since we're using randomness to determine which banner to display, we cannot
		// easily guarantee that the client will have the same banner as the server,
		// thus possibly leading to reconciliation errors. To avoid them, we just render
		// null on component mount, and only afterwards, we update component state to
		// cause a re-render on the client in order to actually render the component.
		// This means however that we have to use `setState` in `componentDidMount`.

		// Set the banner component on mount.
		this.BannerComponent = sample( this.props.banners );

		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState( {
			isClient: true,
		} );
	}

	render() {
		// Client-side.
		if ( this.state.isClient ) {
			const { BannerComponent } = this;
			return <BannerComponent />;
		}

		// Server-side.
		return null;
	}
}

export default RandomThemesBanner;
