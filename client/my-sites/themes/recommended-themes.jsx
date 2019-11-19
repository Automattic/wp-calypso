/**
 * External dependencies
 */
import React from 'react';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */

import { ConnectedThemesSelection } from './themes-selection';
import wpcom from 'lib/wp';

class RecommendedThemes extends React.Component {
	state = {
		themes: [],
	};

	async componentDidMount() {
		this.getRecommendedThemes();
	}

	getRecommendedThemes = async () => {
		// Query to get all template-first themes.
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
				<h1>{ __( 'Recommended Themes:' ) }</h1>
				<ConnectedThemesSelection recommendedThemes={ themes } { ...this.props } />
				<hr />
			</>
		);
	}
}

export default RecommendedThemes;
