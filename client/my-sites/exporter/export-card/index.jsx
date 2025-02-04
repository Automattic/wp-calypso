import { FoldableCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import SpinnerButton from 'calypso/components/spinner-button';
import { Interval, EVERY_SECOND } from 'calypso/lib/interval';
import { withAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	advancedSettingsFetch,
	exportStatusFetch,
	setPostType,
	startExport,
} from 'calypso/state/exporter/actions';
import {
	shouldShowProgress,
	getSelectedPostType,
	isExporting,
} from 'calypso/state/exporter/selectors';
import AdvancedSettings from './advanced-settings';

class ExportCard extends Component {
	componentDidMount() {
		this.props.advancedSettingsFetch( this.props.siteId );
	}

	render() {
		const { translate, fetchStatus } = this.props;

		const exportButton = (
			<SpinnerButton
				className="export-card__export-button"
				loading={ this.props.shouldShowProgress }
				isPrimary={ false }
				onClick={ this.props.exportAll }
				text={ translate( 'Export all' ) }
				loadingText={ translate( 'Exporting…' ) }
			/>
		);

		return (
			<div className="export-card">
				<FoldableCard
					actionButtonIcon="cog"
					header={
						<div>
							<h1 className="export-card__title">{ translate( 'Export content' ) }</h1>
							<h2 className="export-card__subtitle">
								{ translate(
									'Export all (or specific) text content (pages, posts, feedback) from your site.'
								) }
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
						onClickExport={ this.props.exportSelectedItems }
					/>
				</FoldableCard>
				{ this.props.isExporting && <Interval onTick={ fetchStatus } period={ EVERY_SECOND } /> }
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	postType: getSelectedPostType( state ),
	shouldShowProgress: shouldShowProgress( state, siteId ),
	isExporting: isExporting( state, siteId ),
} );

const trackExportClick = ( scope = 'all' ) =>
	recordTracksEvent( 'calypso_export_start_button_click', { scope } );

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	advancedSettingsFetch: flowRight( dispatch, advancedSettingsFetch ),
	setPostType: flowRight( dispatch, setPostType ),
	fetchStatus: () => dispatch( exportStatusFetch( siteId ) ),

	exportAll: () => dispatch( withAnalytics( trackExportClick(), startExport( siteId ) ) ),
	exportSelectedItems: () =>
		dispatch(
			withAnalytics( trackExportClick( 'selected' ), startExport( siteId, { exportAll: false } ) )
		),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( ExportCard ) );
