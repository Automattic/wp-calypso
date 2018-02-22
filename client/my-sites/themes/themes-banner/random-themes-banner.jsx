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

	constructor( props ) {
		super( props );
		const { banners } = props;
		this.state = {
			BannerComponent: sample( banners ),
			isClient: false,
		};
	}

	componentDidMount() {
		// In this particular case, we need to disable the ESLint check
		// to disable using `setState()` on `componentDidMount()`, since
		// it needs to be done this way to properly render the component
		// both on client-side and server-side.
		const state = this.state;

		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState( {
			...state,
			isClient: true,
		} );
	}

	render() {
		const { isClient, BannerComponent } = this.state;

		// Client-side.
		if ( isClient ) {
			return <BannerComponent />;
		}

		// Server-side.
		return null;
	}
}

export default RandomThemesBanner;
