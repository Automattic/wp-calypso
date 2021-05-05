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
import { getRecommendedThemes, getBlockThemes } from 'calypso/state/themes/actions';
import {
	getRecommendedThemes as getRecommendedThemesSelector,
	areRecommendedThemesLoading,
	getBlockThemes as getBlockThemesSelector,
	areBlockThemesLoading,
} from 'calypso/state/themes/selectors';
import isSiteUsingCoreSiteEditor from 'calypso/state/selectors/is-site-using-core-site-editor';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

function getThemesSelector( state, blockThemes = false ) {
	if ( blockThemes ) {
		return getBlockThemesSelector( state );
	}
	return getRecommendedThemesSelector( state );
}

function areThemesLoading( state, blockThemes = false ) {
	if ( blockThemes ) {
		return areBlockThemesLoading( state );
	}
	return areRecommendedThemesLoading( state );
}

class RecommendedThemes extends React.Component {
	componentDidMount() {
		if ( ! this.props.recommendedThemes.length ) {
			this.fetchThemes();
		}
	}

	componentDidUpdate( prevProps ) {
		// Wait until rec themes to be loaded to scroll to search input if its in use.
		const { isLoading, isShowcaseOpen, scrollToSearchInput } = this.props;
		if ( prevProps.isLoading !== isLoading && isLoading === false && isShowcaseOpen ) {
			scrollToSearchInput();
		}
	}

	fetchThemes() {
		if ( this.props.showBlockThemes ) {
			return this.props.getBlockThemes();
		}
		this.props.getRecommendedThemes();
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
		const showBlockThemes = isSiteUsingCoreSiteEditor( state, siteId );
		return {
			showBlockThemes: showBlockThemes,
			recommendedThemes: getThemesSelector( state, showBlockThemes ),
			isLoading: areThemesLoading( state, showBlockThemes ),
		};
	},
	{ getRecommendedThemes, getBlockThemes }
)( RecommendedThemes );

export default ConnectedRecommendedThemes;
