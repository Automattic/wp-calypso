/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { mapAuthor, startImporting } from 'lib/importer/actions';
import { appStates } from 'lib/importer/constants';
import ProgressBar from 'components/progress-bar';
import MappingPane from './author-mapping-pane';

export default React.createClass( {
	displayName: 'SiteSettingsImportingPane',

	mixins: [ React.addons.PureRenderMixin ],

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

	getHeadingText: function() {
		return this.translate(
			'Importing may take a while, but you can ' +
			'safely navigate away from this page if you need ' +
			'to. If you {{b}}stop the import{{/b}}, your site ' +
			'will be {{b2}}partially imported{{/b2}}.', {
				components: {
					b: <strong />,
					b2: <strong />
				}
			}
		);
	},

	getSuccessText: function() {
		const { site: { slug }, counts: { pages, posts } } = this.props.importerStatus,
			pageLink = <a href={ '/pages/' + slug } />,
			pageText = this.translate( 'Pages', { context: 'noun' } ),
			postLink = <a href={ '/posts/' + slug } />,
			postText = this.translate( 'Posts', { context: 'noun' } );

		if ( pages && posts ) {
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

		if ( pages || posts ) {
			return this.translate(
				'All done! Check out {{a}}%(articles)s{{/a}} ' +
				'to see your imported content.', {
					components: { a: pages ? pageLink : postLink },
					args: { articles: pages ? pageText : postText }
				}
			);
		}

		return this.translate( 'Import complete!' );
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
		const { site: { ID: siteId, name: siteName, single_user_site: hasSingleAuthor } } = this.props;
		const { importerId, errorData, customData } = this.props.importerStatus;
		const progressClasses = classNames( 'importer__import-progress', { 'is-complete': this.isFinished() } );
		let { percentComplete = 0, statusMessage } = this.props.importerStatus;

		if ( this.isError() ) {
			statusMessage = errorData.description;
		}

		if ( this.isFinished() ) {
			percentComplete = 100;
			statusMessage = this.getSuccessText();
		}

		return (
			<div className="importer__importing-pane">
				{ ( this.isError() || this.isImporting() ) ?
					<p>{ this.getHeadingText() }</p>
				: null }
				{ this.isMapping() ?
					<MappingPane
						hasSingleAuthor={ hasSingleAuthor }
						onMap={ ( source, target ) => mapAuthor( importerId, source, target ) }
						onStartImport={ () => startImporting( this.props.importerStatus ) }
						{ ...{ siteId } }
						sourceAuthors={ customData.sourceAuthors }
						sourceTitle={ customData.siteTitle || this.translate( 'Original Site' ) }
						targetTitle={ siteName }
					/>
				:
					<div>
						<ProgressBar className={ progressClasses } value={ percentComplete } />
						<p className="importer__status-message">{ statusMessage }</p>
					</div>
				}
			</div>
		);
	}
} );
