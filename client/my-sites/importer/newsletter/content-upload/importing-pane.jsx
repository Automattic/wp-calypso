import { ProgressBar, Spinner } from '@automattic/components';
import clsx from 'clsx';
import { numberFormat, localize } from 'i18n-calypso';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { navigate } from 'calypso/lib/navigate';
import ImporterActionButton from 'calypso/my-sites/importer/importer-action-buttons/action-button';
import BusyImportingButton from 'calypso/my-sites/importer/importer-action-buttons/busy-importing-button';
import ImporterCloseButton from 'calypso/my-sites/importer/importer-action-buttons/close-button';
import ImporterActionButtonContainer from 'calypso/my-sites/importer/importer-action-buttons/container';
import ImporterDoneButton from 'calypso/my-sites/importer/importer-action-buttons/done-button';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { mapAuthor, resetImport, startImporting } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import AuthorMappingPane from './author-mapping-pane';

import './importing-pane.scss';

const sum = ( a, b ) => a + b;

/*
 * The progress object comes from the API and can
 * contain different object counts.
 *
 * The attachments will lead the progress because
 * they take the longest in almost all circumstances.
 *
 * progressObect ~= {
 *     post: { completed: 3, total: 12 },
 *     comment: { completed: 0, total: 3 },
 *     …
 * }
 */
export const calculateProgress = ( progress ) => {
	// The backend does not output the 'progress' field for all the enqueued not running imports.
	if ( ! progress ) {
		return 0;
	}

	const { attachment = {} } = progress;

	if ( attachment.total > 0 && attachment.completed >= 0 ) {
		// return a weight of 80% attachment, 20% other objects
		return (
			( 80 * attachment.completed ) / attachment.total +
			0.2 * calculateProgress( omit( progress, [ 'attachment' ] ) )
		);
	}

	const percentages = Object.keys( progress )
		.map( ( k ) => progress[ k ] ) // get the inner objects themselves
		.filter( ( { total } ) => total > 0 ) // skip ones with no objects to import
		.map( ( { completed, total } ) => completed / total ); // compute the individual percentages

	return ( 100 * percentages.reduce( sum, 0 ) ) / percentages.length;
};

export const resourcesRemaining = ( progress ) =>
	Object.keys( progress )
		.map( ( k ) => progress[ k ] )
		.map( ( { completed, total } ) => total - completed )
		.reduce( sum, 0 );

export const hasProgressInfo = ( progress ) => {
	if ( ! progress ) {
		return false;
	}

	const types = Object.values( progress ).filter( ( { total } ) => total > 0 );

	if ( ! types.length ) {
		return false;
	}

	const firstType = types.shift();
	if ( ! firstType.hasOwnProperty( 'completed' ) ) {
		return false;
	}

	return true;
};

export class ImportingPane extends PureComponent {
	static displayName = 'ImportingPane';

	static propTypes = {
		importerStatus: PropTypes.shape( {
			counts: PropTypes.shape( {
				comments: PropTypes.number,
				pages: PropTypes.number,
				posts: PropTypes.number,
			} ),
			importerState: PropTypes.string.isRequired,
			percentComplete: PropTypes.number,
			statusMessage: PropTypes.string,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			single_user_site: PropTypes.bool.isRequired,
		} ).isRequired,
		sourceType: PropTypes.string.isRequired,
		nextStepUrl: PropTypes.string.isRequired,
	};

	getErrorMessage = ( { description } ) => {
		if ( ! description ) {
			return this.props.translate( 'An unspecified error occured during the import.' );
		}

		return description;
	};

	getHeadingTextProcessing = () => {
		return this.props.translate( 'Processing your file. Please wait a few moments.' );
	};

	getSuccessText = () => {
		return this.props.translate( 'Success! Your content has been imported.' );
	};

	getImportMessage = ( numResources ) => {
		if ( 0 === numResources ) {
			return this.props.translate( 'Finishing up the import.' );
		}

		return this.props.translate(
			'%(numResources)s post, page, or media file left to import',
			'%(numResources)s posts, pages, and media files left to import',
			{
				count: numResources,
				args: { numResources: numberFormat( numResources ) },
			}
		);
	};

	isError = () => {
		return this.isInState( appStates.IMPORT_FAILURE );
	};

	isFinished = () => {
		return this.isInState( appStates.IMPORT_SUCCESS );
	};

	isImporting = () => {
		return this.isInState( appStates.IMPORTING );
	};

	isProcessing = () => {
		return this.isInState( appStates.UPLOAD_PROCESSING );
	};

	isInState = ( state ) => {
		return state === this.props.importerStatus.importerState;
	};

	isMapping = () => {
		return this.isInState( appStates.MAP_AUTHORS );
	};

	handleOnMap = ( source, target ) =>
		this.props.mapAuthor( this.props.importerStatus.importerId, source, target );

	onClickSubstackDone = ( action ) => {
		this.props.recordTracksEvent( 'calypso_importer_main_done_clicked', {
			importer_id: this.props.importerStatus.type,
			action,
		} );

		this.props.resetImport( this.props.site.ID, this.props.importerStatus.importerId );
	};

	renderActionButtons = ( sourceType ) => {
		if ( this.isProcessing() || this.isMapping() ) {
			// We either don't want to show buttons while processing
			// or, in the case of `isMapping`, we let another component (author-mapping-pane)
			// take care of rendering the buttons.
			return null;
		}

		const { importerStatus, site, nextStepUrl } = this.props;
		const isFinished = this.isFinished();
		const isImporting = this.isImporting();
		const isError = this.isError();
		const showFallbackButton = isError || ( ! isImporting && ! isFinished );

		// After Substack importer we nudge to view posts or
		if ( sourceType === 'Substack' && isFinished ) {
			return (
				<ImporterActionButtonContainer noSpacing>
					<ImporterActionButton href={ nextStepUrl } primary>
						{ this.props.translate( 'Continue' ) }
					</ImporterActionButton>
				</ImporterActionButtonContainer>
			);
		}

		// Other importers nudge to view the site
		return (
			<ImporterActionButtonContainer noSpacing>
				{ isImporting && <BusyImportingButton /> }
				{ isFinished && <ImporterDoneButton importerStatus={ importerStatus } site={ site } /> }
				{ showFallbackButton && (
					<ImporterCloseButton importerStatus={ importerStatus } site={ site } isEnabled />
				) }
			</ImporterActionButtonContainer>
		);
	};

	render() {
		const {
			importerStatus,
			site: { ID: siteId, name: siteName },
			sourceType,
			site,
		} = this.props;
		const { customData } = importerStatus;
		const progressClasses = clsx( 'importer__import-progress', {
			'is-complete': this.isFinished(),
		} );

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
			<div className="importer__importing-pane">
				{ this.isProcessing() && <p>{ this.getHeadingTextProcessing() }</p> }
				{ this.isMapping() && (
					<AuthorMappingPane
						onMap={ this.handleOnMap }
						onStartImport={ () => {
							this.props.startImporting( this.props.importerStatus );
							navigate( this.props.nextStepUrl );
						} }
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
						<ProgressBar className={ progressClasses } value={ percentComplete } />
					) : (
						<div>
							<Spinner className="importer__import-spinner" />
							<br />
						</div>
					) ) }
				{ blockingMessage && (
					<div className="importer__import-progress-message">{ blockingMessage }</div>
				) }
				{ statusMessage && (
					<div>
						<p className="importer__status-message">{ statusMessage }</p>
					</div>
				) }
				{ this.renderActionButtons( sourceType ) }
			</div>
		);
	}
}

export default connect( null, {
	mapAuthor,
	recordTracksEvent,
	resetImport,
	startImporting,
} )( localize( ImportingPane ) );
