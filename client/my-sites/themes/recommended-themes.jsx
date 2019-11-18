/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */

import ThemesSelection from './themes-selection';
import wpcom from 'lib/wp';

class RecommendedThemes extends React.Component {
	state = {
		themes: [],
	};

	async componentDidMount() {
		this.getRecommendedThemes();
	}

	getRecommendedThemes = async () => {
		const query = {
			search: 'varia',
			number: 50,
			tier: 'free',
			filters: 'featured',
			apiVersion: '1.2',
		};
		const res = await wpcom.undocumented().themes( null, query );

		this.setState( { themes: res.themes } );
	};

	render() {
		const { themes } = this.state;

		return (
			<>
				<h1>We are the greatest Themes! Choose us...</h1>
				<ThemesSelection recommendedThemes={ themes } { ...this.props } />
				<hr />
			</>
		);
	}
}

export default RecommendedThemes;
