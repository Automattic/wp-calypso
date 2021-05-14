/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';
/**
 * Internal dependencies
 */
import { ConnectedThemesSelection } from './themes-selection';
import Spinner from 'calypso/components/spinner';
import { getRecommendedThemes } from 'calypso/state/themes/actions';

import {
	getRecommendedThemes as getRecommendedThemesSelector,
	areRecommendedThemesLoading,
} from 'calypso/state/themes/selectors';
import isSiteUsingCoreSiteEditor from 'calypso/state/selectors/is-site-using-core-site-editor';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class RecommendedThemes extends React.Component {
	componentDidMount() {
		if ( ! this.props.recommendedThemes.length ) {
			this.fetchThemes();
		}
	}

	componentDidUpdate( prevProps ) {
		// Wait until rec themes to be loaded to scroll to search input if its in use.
		const { isLoading, isShowcaseOpen, scrollToSearchInput, isUsingSiteEditor } = this.props;
		if ( prevProps.isLoading !== isLoading && isLoading === false && isShowcaseOpen ) {
			scrollToSearchInput();
		}
		if ( prevProps.isUsingSiteEditor !== isUsingSiteEditor ) {
			this.fetchThemes();
		}
	}

	fetchThemes() {
		this.props.getRecommendedThemes( this.props.isUsingSiteEditor );
	}

	render() {
		return (
			<>
				<h2>
					<strong>{ translate( 'Recommended themes' ) }</strong>
				</h2>
				{ this.props.isLoading ? (
					<Spinner size={ 100 } />
				) : (
					<ConnectedThemesSelection { ...this.props } />
				) }
			</>
		);
	}
}

const ConnectedRecommendedThemes = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const isUsingSiteEditor = isSiteUsingCoreSiteEditor( state, siteId );
		return {
			recommendedThemes: getRecommendedThemesSelector( state, isUsingSiteEditor ),
			isLoading: areRecommendedThemesLoading( state, isUsingSiteEditor ),
			isUsingSiteEditor,
		};
	},
	{ getRecommendedThemes }
)( RecommendedThemes );

export default ConnectedRecommendedThemes;
