import { ProgressBar } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Spinner from 'calypso/components/spinner';
import AuthorMappingPane from 'calypso/my-sites/importer/author-mapping-pane';
import {
	calculateProgress,
	hasProgressInfo,
	ImportingPane as ImportingPaneBase,
	resourcesRemaining,
} from 'calypso/my-sites/importer/importing-pane';
import { UrlData } from 'calypso/signup/steps/import/types';
import { loadTrackingTool } from 'calypso/state/analytics/actions';
import { mapAuthor, startImporting } from 'calypso/state/imports/actions';
import './importing-pane.scss';

class ImportingPane extends ImportingPaneBase {
	render() {
		const {
			importerStatus,
			site: { ID: siteId, name: siteName, single_user_site: hasSingleAuthor },
			sourceType,
			site,
			urlData,
		} = this.props;
		const { customData } = importerStatus;
		const progressClasses = classNames( 'importing-pane__progress', {
			'is-complete': this.isFinished(),
		} );

		// Add the site favicon as author's icon
		if ( importerStatus?.customData?.sourceAuthors ) {
			for ( const author of importerStatus.customData.sourceAuthors ) {
				author.icon = ( urlData as UrlData )?.meta?.favicon;
			}
		}

		let { percentComplete, statusMessage } = this.props.importerStatus;
		const { progress } = this.props.importerStatus;
		let blockingMessage;

		if ( this.isError() ) {
			/**
			 * TODO: This is for the status message that appears at the bottom
			 * of the import section. This shouldn't be used for Error reporting.
			 */
			statusMessage = '';
		}

		if ( this.isFinished() ) {
			percentComplete = 100;
			statusMessage = this.getSuccessText();
		}

		if ( this.isImporting() && hasProgressInfo( progress ) ) {
			const remainingResources = resourcesRemaining( progress );
			percentComplete = calculateProgress( progress );
			blockingMessage = this.getImportMessage( remainingResources );
		}

		return (
			<div className="importing-pane">
				{ this.isImporting() && <p>{ this.getHeadingText() }</p> }
				{ this.isProcessing() && <p>{ this.getHeadingTextProcessing() }</p> }
				{ this.isMapping() && (
					<AuthorMappingPane
						hasSingleAuthor={ hasSingleAuthor }
						onMap={ this.handleOnMap }
						onStartImport={ () => this.props.startImporting( this.props.importerStatus ) }
						siteId={ siteId }
						sourceType={ sourceType }
						sourceAuthors={ customData.sourceAuthors }
						sourceTitle={ customData.siteTitle || this.props.translate( 'Original Site' ) }
						targetTitle={ siteName }
						importerStatus={ importerStatus }
						site={ site }
					/>
				) }
				{ ( this.isImporting() || this.isProcessing() ) &&
					( percentComplete >= 0 ? (
						<ProgressBar
							color={ 'black' }
							compact={ true }
							className={ progressClasses }
							value={ percentComplete }
						/>
					) : (
						<div>
							<Spinner className="importing-pane__spinner" />
							<br />
						</div>
					) ) }
				{ blockingMessage && (
					<div className="importing-pane__progress-message">{ blockingMessage }</div>
				) }
				<div>
					<p className="importing-pane__status-message">{ statusMessage }</p>
				</div>
			</div>
		);
	}
}

export default connect( null, {
	loadTrackingTool,
	mapAuthor,
	startImporting,
} )( localize( ImportingPane ) );
