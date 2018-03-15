/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { isEqual, sample } from 'lodash';

class RandomThemesBanner extends PureComponent {
	static propTypes = {
		banners: PropTypes.array.isRequired,
	};

	state = {
		banner: null,
	};

	componentDidMount() {
		// Since we're using randomness to determine which banner to display, we cannot
		// easily guarantee that the client will have the same banner as the server,
		// thus possibly leading to reconciliation errors. To avoid them, we just render
		// null on component mount, and only afterwards, we update component state to
		// cause a re-render on the client in order to actually render the component.
		// This means however that we have to use `setState` in `componentDidMount`.

		// Set the banner component on mount.
		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState( {
			banner: sample( this.props.banners ),
		} );
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( this.props.banners, nextProps.banners ) ) {
			this.setState( {
				banner: sample( nextProps.banners ),
			} );
		}
	}

	render() {
		// Client-side.
		if ( this.state.banner ) {
			const BannerComponent = this.state.banner;
			return <BannerComponent />;
		}

		// Server-side.
		return null;
	}
}

export default RandomThemesBanner;
