/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { numberFormat, localize } from 'i18n-calypso';
import { defer, get, has, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { mapAuthor, startImporting } from 'lib/importer/actions';
import { appStates } from 'state/imports/constants';
import { ProgressBar } from '@automattic/components';
import AuthorMappingPane from './author-mapping-pane';
import Spinner from 'components/spinner';
import { loadTrackingTool } from 'state/analytics/actions';

import ImporterCloseButton from 'my-sites/importer/importer-action-buttons/close-button';
import ImporterDoneButton from 'my-sites/importer/importer-action-buttons/done-button';
import BusyImportingButton from 'my-sites/importer/importer-action-buttons/busy-importing-button';
import ImporterActionButtonContainer from 'my-sites/importer/importer-action-buttons/container';

/**
 * Style dependencies
 */
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
const calculateProgress = ( progress ) => {
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

const resourcesRemaining = ( progress ) =>
	Object.keys( progress )
		.map( ( k ) => progress[ k ] )
		.map( ( { completed, total } ) => total - completed )
		.reduce( sum, 0 );

const hasProgressInfo = ( progress ) => {
	if ( ! progress ) {
		return false;
	}

	const types = Object.keys( progress )
		.map( ( k ) => progress[ k ] )
		.filter( ( { total } ) => total > 0 );

	if ( ! types.length ) {
		return false;
	}

	const firstType = types.shift();
	if ( ! has( firstType, 'completed' ) ) {
		return false;
	}

	return true;
};

class ImportingPane extends React.PureComponent {
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
			site: PropTypes.shape( {
				slug: PropTypes.string.isRequired,
			} ),
			statusMessage: PropTypes.string,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			single_user_site: PropTypes.bool.isRequired,
		} ).isRequired,
		sourceType: PropTypes.string.isRequired,
	};

	getErrorMessage = ( { description } ) => {
		if ( ! description ) {
			return this.props.translate( 'An unspecified error occured during the import.' );
		}

		return description;
	};

	getHeadingText = () => {
		return this.props.translate(
			"You can safely navigate away from this page if you need to; we'll send you a notification when it's done."
		);
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

	maybeLoadHotJar = () => {
		if ( this.hjLoaded || ! this.isImporting() ) {
			return;
		}

		this.hjLoaded = true;

		this.props.loadTrackingTool( 'HotJar' );
	};

	componentDidMount() {
		this.maybeLoadHotJar();
	}

	componentDidUpdate() {
		this.maybeLoadHotJar();
	}

	handleOnMap = ( source, target ) =>
		defer( () => mapAuthor( get( this.props, 'importerStatus.importerId' ), source, target ) );

	renderActionButtons = () => {
		if ( this.isProcessing() || this.isMapping() ) {
			// We either don't want to show buttons while processing
			// or, in the case of `isMapping`, we let another component (author-mapping-pane)
			// take care of rendering the buttons.
			return null;
		}

		const { importerStatus, site } = this.props;
		const isFinished = this.isFinished();
		const isImporting = this.isImporting();
		const isError = this.isError();
		const showFallbackButton = isError || ( ! isImporting && ! isFinished );

		return (
			<ImporterActionButtonContainer>
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
			site: { ID: siteId, name: siteName, single_user_site: hasSingleAuthor },
			sourceType,
			site,
		} = this.props;
		const { customData } = importerStatus;
		const progressClasses = classNames( 'importer__import-progress', {
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
				{ this.isImporting() && <p>{ this.getHeadingText() }</p> }
				{ this.isProcessing() && <p>{ this.getHeadingTextProcessing() }</p> }
				{ this.isMapping() && (
					<AuthorMappingPane
						hasSingleAuthor={ hasSingleAuthor }
						onMap={ this.handleOnMap }
						onStartImport={ () => startImporting( this.props.importerStatus ) }
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
				<div>
					<p className="importer__status-message">{ statusMessage }</p>
				</div>
				{ this.renderActionButtons() }
			</div>
		);
	}
}

export default connect( null, { loadTrackingTool } )( localize( ImportingPane ) );
