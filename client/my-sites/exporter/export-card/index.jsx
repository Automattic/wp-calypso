/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import flowRight from 'lodash/flowRight';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SpinnerButton from './spinner-button';
import FoldableCard from 'components/foldable-card';
import analytics from 'lib/analytics';
import Interval, { EVERY_SECOND } from 'lib/interval';
import AdvancedSettings from './advanced-settings';
import {
	advancedSettingsFetch,
	exportStatusFetch,
	setPostType,
	startExport,
} from 'state/site-settings/exporter/actions';
import {
	shouldShowProgress,
	getSelectedPostType,
	isExporting,
} from 'state/site-settings/exporter/selectors';

class ExportCard extends Component {
	componentWillMount() {
		this.props.advancedSettingsFetch( this.props.siteId );
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.siteId !== this.props.siteId ) {
			this.props.advancedSettingsFetch( newProps.siteId );
		}
	}

	trackExportClick = ( scope = 'all' ) => {
		analytics.tracks.recordEvent( 'calypso_export_start_button_click', { scope } );
	}

	exportAll = () => {
		this.trackExportClick();
		this.props.startExport();
	}

	exportSelectedItems = () => {
		this.trackExportClick( 'selected' );
		this.props.startExport( { exportAll: false } );
	}

	render() {
		const {
			translate,
			fetchStatus,
		} = this.props;

		const exportButton = (
			<SpinnerButton
				className="export-card__export-button"
				loading={ this.props.shouldShowProgress }
				isPrimary={ true }
				onClick={ this.exportAll }
				text={ translate( 'Export All' ) }
				loadingText={ translate( 'Exporting…' ) } />
		);

		return (
			<div className="export-card">
				<FoldableCard
					actionButtonIcon="cog"
					header={
						<div>
							<h1 className="export-card__title">
								{ translate( 'Export your content' ) }
							</h1>
							<h2 className="export-card__subtitle">
								{ translate( 'Or select specific content items to export' ) }
							</h2>
						</div>
					}
					summary={ exportButton }
					expandedSummary={ exportButton }
				>
					<AdvancedSettings
						postType={ this.props.postType }
						shouldShowProgress={ this.props.shouldShowProgress }
						onSelectPostType={ this.props.setPostType }
						onClickExport={ this.exportSelectedItems }
					/>
				</FoldableCard>
				{ this.props.isExporting && <Interval onTick={ fetchStatus } period={ EVERY_SECOND } /> }
			</div>
		);
	}
}

function mapStateToProps( state, { siteId } ) {
	return {
		postType: getSelectedPostType( state ),
		shouldShowProgress: shouldShowProgress( state, siteId ),
		isExporting: isExporting( state, siteId ),
	};
}

function mapDispatchToProps( dispatch, { siteId } ) {
	return {
		advancedSettingsFetch: flowRight( dispatch, advancedSettingsFetch ),
		setPostType: flowRight( dispatch, setPostType ),
		fetchStatus: () => dispatch( exportStatusFetch( siteId ) ),
		startExport: options => dispatch( startExport( siteId, options ) ),
	};
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ExportCard ) );
