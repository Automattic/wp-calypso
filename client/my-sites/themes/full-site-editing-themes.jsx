/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
/**
 * Internal dependencies
 */
import { ConnectedThemesSelection } from './themes-selection';
import { getFullSiteEditingThemes } from 'calypso/state/themes/actions';

import {
	getFullSiteEditingThemes as getFullSiteEditingThemesSelector,
	areFullSiteEditingThemesLoading,
} from 'calypso/state/themes/selectors';

class FullSiteEditingThemes extends React.Component {
	componentDidMount() {
		if ( ! this.props.fullSiteEditingThemes.length ) {
			this.fetchThemes();
		}
	}

	componentDidUpdate( prevProps ) {
		// Wait until full site editing themes to be loaded to scroll to search input if its in use.
		const { isLoading, scrollToSearchInput, filter } = this.props;

		if ( prevProps.isLoading !== isLoading && isLoading === false ) {
			scrollToSearchInput();
		}

		if ( prevProps.filter !== filter ) {
			this.fetchThemes();
		}
	}

	fetchThemes() {
		this.props.getFullSiteEditingThemes( this.props.filter );
	}

	render() {
		return <ConnectedThemesSelection { ...this.props } />;
	}
}

const ConnectedFullSiteEditingThemes = connect(
	( state ) => {
		const filter = 'feature:full-site-editing';
		return {
			fullSiteEditingThemes: getFullSiteEditingThemesSelector( state, filter ),
			isLoading: areFullSiteEditingThemesLoading( state, filter ),
			filter,
		};
	},
	{ getFullSiteEditingThemes }
)( FullSiteEditingThemes );

export default ConnectedFullSiteEditingThemes;
