/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'lodash';

/**
 * Internal dependencies
 */
import Exporter from './exporter';

import {
	getUIState,
	getAuthorOptions,
	getStatusOptions,
	getDateOptions,
	getCategoryOptions,
	isLoadingOptions,
	shouldShowProgress,
} from 'state/site-settings/exporter/selectors';

import {
	setPostType,
	setAdvancedSetting,
	startExport,
	ensureHasSettings
} from 'state/site-settings/exporter/actions';

import { getSelectedSite } from 'state/ui/selectors';

class ExporterContainer extends Component {

	componentDidMount() {
		this.props.ensureHasSettings();
	}

	componentWillReceiveProps() {
		this.props.ensureHasSettings();
	}

	render() {
		return <Exporter { ...this.props } />
	}
}

function mapStateToProps( state ) {
	const uiState = getUIState( state );
	const selectedSite = getSelectedSite( state );

	const START_OF_MONTH = false;
	const END_OF_MONTH = true;

	return {
		siteId: selectedSite && selectedSite.ID,
		postType: uiState.postType,
		advancedSettings: uiState.advancedSettings,
		isLoadingOptions: isLoadingOptions( state ),
		shouldShowProgress: shouldShowProgress( state ),
		options: {
			posts: {
				authors: getAuthorOptions( state, 'post' ),
				statuses: getStatusOptions( state, 'post' ),
				startDates: getDateOptions( state, 'post', START_OF_MONTH ),
				endDates: getDateOptions( state, 'post', END_OF_MONTH ),
				categories: getCategoryOptions( state, 'post' )
			},
			pages: {
				authors: getAuthorOptions( state, 'page' ),
				statuses: getStatusOptions( state, 'page' ),
				startDates: getDateOptions( state, 'page', START_OF_MONTH ),
				endDates: getDateOptions( state, 'page', END_OF_MONTH )
			}
		}
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		setPostType: compose( dispatch, setPostType ),
		setAdvancedSetting: compose( dispatch, setAdvancedSetting ),
		startExport: compose( dispatch, startExport ),
		ensureHasSettings: compose( dispatch, ensureHasSettings )
	};
}

export default connect( mapStateToProps, mapDispatchToProps )( ExporterContainer );
