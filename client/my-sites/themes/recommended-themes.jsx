/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import { ConnectedThemesSelection } from './themes-selection';
import Spinner from 'components/spinner';
import wpcom from 'lib/wp';

class RecommendedThemes extends React.Component {
	state = {
		themes: [],
		isLoading: true,
	};

	async componentDidMount() {
		this.getRecommendedThemes();
	}

	getRecommendedThemes = async () => {
		// Query to get all template-first themes.
		const query = {
			search: '',
			number: 50,
			tier: '',
			filter: 'auto-loading-homepage',
			apiVersion: '1.2',
		};
		const res = await wpcom.undocumented().themes( null, query );

		this.setState( { themes: res.themes, isLoading: false } );
	};

	render() {
		const { themes } = this.state;

		return (
			<>
				<h1>{ translate( 'Recommended Themes:' ) }</h1>
				{ this.state.isLoading ? (
					<Spinner size={ 100 } />
				) : (
					<ConnectedThemesSelection recommendedThemes={ themes } { ...this.props } />
				) }
			</>
		);
	}
}

export default RecommendedThemes;
