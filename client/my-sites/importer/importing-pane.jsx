/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import classNames from 'classnames';
import { numberFormat, translate } from 'i18n-calypso';
import { has, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { mapAuthor, startImporting } from 'lib/importer/actions';
import { appStates } from 'state/imports/constants';
import { connectDispatcher } from './dispatcher-converter';
import ProgressBar from 'components/progress-bar';
import MappingPane from './author-mapping-pane';
import Spinner from 'components/spinner';

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
const calculateProgress = progress => {
	const { attachment = {} } = progress;

	if ( attachment.total > 0 && attachment.completed >= 0 ) {
		// return a weight of 80% attachment, 20% other objects
		return 80 * attachment.completed / attachment.total +
			0.2 * calculateProgress( omit( progress, [ 'attachment' ] ) );
	}

	const percentages = Object.keys( progress )
		.map( k => progress[ k ] ) // get the inner objects themselves
		.filter( ( { total } ) => total > 0 ) // skip ones with no objects to import
		.map( ( { completed, total } ) => completed / total ); // compute the individual percentages

	return 100 * percentages.reduce( sum, 0 ) / percentages.length;
};

const resourcesRemaining = progress => Object.keys( progress )
		.map( k => progress[ k ] )
		.map( ( { completed, total } ) => total - completed )
		.reduce( sum, 0 );

const hasProgressInfo = progress => {
	if ( ! progress ) {
		return false;
	}

	const types = Object
		.keys( progress )
		.map( k => progress[ k ] )
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

export const ImportingPane = React.createClass( {
	displayName: 'SiteSettingsImportingPane',

	mixins: [ PureRenderMixin ],

	propTypes: {
		importerStatus: PropTypes.shape( {
			counts: PropTypes.shape( {
				comments: PropTypes.number,
				pages: PropTypes.number,
				posts: PropTypes.number
			} ),
			errorData: PropTypes.shape( {
				description: PropTypes.string.isRequired,
				type: PropTypes.string.isRequired
			} ),
			importerState: PropTypes.string.isRequired,
			percentComplete: PropTypes.number,
			site: PropTypes.shape( {
				slug: PropTypes.string.isRequired
			} ),
			statusMessage: PropTypes.string
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			single_user_site: PropTypes.bool.isRequired
		} ).isRequired
	},

	getErrorMessage( { description } ) {
		if ( ! description ) {
			return translate( 'An unspecified error occured during the import.' );
		}

		return description;
	},

	getHeadingText: function() {
		return translate(
			'Importing takes 15 minutes or a while longer if your site has a lot of media. ' +
			'You can safely navigate away from this page if you need to: we\'ll send you a notification when it\'s done.'
		);
	},

	getSuccessText: function() {
		const { site: { slug }, progress: { page, post } } = this.props.importerStatus,
			pageLink = <a href={ '/pages/' + slug } />,
			pageText = translate( 'Pages', { context: 'noun' } ),
			postLink = <a href={ '/posts/' + slug } />,
			postText = translate( 'Posts', { context: 'noun' } );

		const pageCount = page.total;
		const postCount = post.total;

		if ( pageCount && postCount ) {
			return this.translate(
				'All done! Check out {{a}}Posts{{/a}} or ' +
				'{{b}}Pages{{/b}} to see your imported content.', {
					components: {
						a: postLink,
						b: pageLink
					}
				}
			);
		}

		if ( pageCount || postCount ) {
			return this.translate(
				'All done! Check out {{a}}%(articles)s{{/a}} ' +
				'to see your imported content.', {
					components: { a: pageCount ? pageLink : postLink },
					args: { articles: pageCount ? pageText : postText }
				}
			);
		}

		return translate( 'Import complete!' );
	},

	getImportMessage( numResources ) {
		if ( 0 === numResources ) {
			return translate( 'Finishing up the import' );
		}

		return translate(
			'Waiting on %(numResources)s resource to import',
			'Waiting on %(numResources)s resources to import',
			{
				count: numResources,
				args: { numResources: numberFormat( numResources ) }
			}
		);
	},

	isError: function() {
		return this.isInState( appStates.IMPORT_FAILURE );
	},

	isFinished: function() {
		return this.isInState( appStates.IMPORT_SUCCESS );
	},

	isImporting: function() {
		return this.isInState( appStates.IMPORTING );
	},

	isInState: function( state ) {
		return state === this.props.importerStatus.importerState;
	},

	isMapping: function() {
		return this.isInState( appStates.MAP_AUTHORS );
	},

	render: function() {
		const {
			importerStatus: {
				importerId,
				errorData = {},
				customData
			},
			mapAuthorFor,
			site: {
				ID: siteId,
				name: siteName,
				single_user_site: hasSingleAuthor
			}
		} = this.props;

		const progressClasses = classNames( 'importer__import-progress', { 'is-complete': this.isFinished() } );

		let { percentComplete, progress, statusMessage } = this.props.importerStatus;
		let blockingMessage;

		if ( this.isError() ) {
			statusMessage = this.getErrorMessage( errorData );
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
				{ this.isMapping() &&
					<MappingPane
						hasSingleAuthor={ hasSingleAuthor }
						onMap={ mapAuthorFor( importerId ) }
						onStartImport={ () => startImporting( this.props.importerStatus ) }
						{ ...{ siteId } }
						sourceAuthors={ customData.sourceAuthors }
						sourceTitle={ customData.siteTitle || translate( 'Original Site' ) }
						targetTitle={ siteName }
					/>
				}
				{ this.isImporting() && (
					percentComplete >= 0
						? <ProgressBar className={ progressClasses } value={ percentComplete } />
						: <div><Spinner className="importer__import-spinner" /><br /></div>
				) }
				{ blockingMessage && <div>{ blockingMessage }</div> }
				<div><p className="importer__status-message">{ statusMessage }</p></div>
			</div>
		);
	}
} );

const mapDispatchToProps = dispatch => ( {
	mapAuthorFor: importerId => ( source, target ) => dispatch( mapAuthor( importerId, source, target ) )
} );

export default connectDispatcher( null, mapDispatchToProps )( ImportingPane );
