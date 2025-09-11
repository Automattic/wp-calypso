import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { formatNumber } from '@automattic/number-formatters';
import { Notice } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { verse, page, file } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import useUsersQuery from 'calypso/data/users/use-users-query';
import AuthorMapping from 'calypso/my-sites/importer/author-mapping-item';
import ImporterActionButton from 'calypso/my-sites/importer/importer-action-buttons/action-button';
import ImporterActionButtonContainer from 'calypso/my-sites/importer/importer-action-buttons/container';
import { SummaryStat } from '../components';

class AuthorMappingPane extends PureComponent {
	static displayName = 'AuthorMappingPane';

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
			customData: PropTypes.shape( {
				unsupportedFileTypes: PropTypes.oneOfType( [
					PropTypes.objectOf( PropTypes.number ),
					PropTypes.array, // If there are no errors we get an empty array
				] ),
				postErrors: PropTypes.oneOfType( [
					PropTypes.object,
					PropTypes.array, // If there are no errors we get an empty array
				] ),
				postsNumber: PropTypes.number,
				pagesNumber: PropTypes.number,
				attachmentsNumber: PropTypes.number,
			} ),
		} ),
		onMap: PropTypes.func,
		onStartImport: PropTypes.func,
		siteId: PropTypes.number.isRequired,
		sourceAuthors: PropTypes.arrayOf(
			PropTypes.shape( {
				id: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired,
				icon: PropTypes.string,
			} ).isRequired
		).isRequired,
		sourceTitle: PropTypes.string.isRequired,
		targetTitle: PropTypes.string.isRequired,
		sourceType: PropTypes.string,
	};

	getFetchOptions = ( options = {} ) => {
		return Object.assign(
			{
				number: 50,
				order: 'ASC',
				order_by: 'display_name',
				siteId: this.props.siteId,
			},
			options
		);
	};

	getMappingDescription = ( numSourceUsers, numTargetUsers, targetTitle, sourceType ) => {
		if ( numTargetUsers === 1 && numSourceUsers === 1 ) {
			return this.props.translate(
				'There is one author on your %(sourceType)s site. ' +
					"Because you're the only author on {{b}}%(destinationSiteTitle)s{{/b}}, " +
					'all imported content will be assigned to you. ' +
					'Click {{em}}Import{{/em}} to proceed.',
				{
					args: {
						sourceType: sourceType,
						destinationSiteTitle: targetTitle,
					},
					components: {
						b: <strong />,
						em: <em />,
					},
				}
			);
		} else if ( numTargetUsers === 1 && numSourceUsers > 1 ) {
			return this.props.translate(
				'There are multiple authors on your %(sourceType)s site. ' +
					"Because you're the only author on {{b}}%(destinationSiteTitle)s{{/b}}, " +
					'all imported content will be assigned to you. ' +
					'Click {{em}}Import{{/em}} to proceed.',
				{
					args: {
						sourceType: sourceType,
						destinationSiteTitle: targetTitle,
					},
					components: {
						b: <strong />,
						em: <em />,
					},
				}
			);
		} else if ( numTargetUsers > 1 && numSourceUsers === 1 ) {
			return this.props.translate(
				'There are multiple authors on your site. ' +
					'Please reassign the authors of the imported items to an existing ' +
					'user on {{b}}%(destinationSiteTitle)s{{/b}}, then click {{em}}Import{{/em}}.',
				{
					args: {
						sourceType: 'WordPress',
						destinationSiteTitle: targetTitle,
					},
					components: {
						b: <strong />,
						em: <em />,
					},
				}
			);
		} else if ( numTargetUsers > 1 && numSourceUsers > 1 ) {
			return this.props.translate(
				'There are multiple authors on your %(sourceType)s site. ' +
					'Please reassign the authors of the imported items to an existing ' +
					'user on {{b}}%(destinationSiteTitle)s{{/b}}, then click {{em}}Import{{/em}}.',
				{
					args: {
						sourceType: 'WordPress',
						destinationSiteTitle: targetTitle,
					},
					components: {
						b: <strong />,
						em: <em />,
					},
				}
			);
		}
	};

	getUnsupportedFilesMessage() {
		const { translate } = this.props;
		const unsupportedFiles = this.props.importerStatus?.customData?.unsupportedFileTypes;

		if ( ! unsupportedFiles ) {
			return null;
		}

		const fileTypes = Object.entries( unsupportedFiles ).filter( function ( entry ) {
			return entry[ 1 ] > 0;
		} );
		if ( fileTypes.length === 0 ) {
			return null;
		}

		const formattedTypes = fileTypes.map( ( [ type, count ] ) => {
			/* translators: %(count)s is the number of files, %(type)s is the file extension (e.g. "avif", "svg") */
			return translate( '%(count)s .%(type)s image', '%(count)s .%(type)s images', {
				args: {
					count: formatNumber( count ),
					type,
				},
				count,
			} );
		} );

		const learnMoreLink = (
			<InlineSupportLink
				showIcon={ false }
				supportLink={ localizeUrl( 'https://wordpress.com/support/accepted-filetypes/#images' ) }
				supportPostId={ 2037 }
			/>
		);

		if ( formattedTypes.length === 1 ) {
			/* translators: %(files)s is a formatted string like "3 .avif images". {{learnMoreLink}} is a link to the documentation */
			return translate(
				'We were unable to import %(files)s. {{learnMoreLink}}Learn more{{/learnMoreLink}}',
				{
					args: { files: formattedTypes[ 0 ] },
					components: {
						learnMoreLink,
					},
				}
			);
		}

		const lastType = formattedTypes.pop();
		/* translators: %(files)s is a comma-separated list of file types (e.g. "3 .avif images, 1 .svg image"),
		   %(lastFile)s is the last file type in the list. {{learnMoreLink}} is a link to the documentation */
		return translate(
			'We were unable to import %(files)s and %(lastFile)s. {{learnMoreLink}}Learn more{{/learnMoreLink}}',
			{
				args: {
					files: formattedTypes.join( ', ' ),
					lastFile: lastType,
				},
				components: {
					learnMoreLink,
				},
			}
		);
	}

	componentDidMount() {
		recordTracksEvent( 'calypso_site_importer_map_authors_single' );
	}

	render() {
		const {
			importerStatus,
			sourceAuthors,
			sourceTitle,
			targetTitle,
			onMap,
			onStartImport,
			siteId,
			sourceType,
			totalUsers,
		} = this.props;

		const hasSingleAuthor = totalUsers === 1;
		const canStartImport = hasSingleAuthor || sourceAuthors.every( ( author ) => author.mappedTo );
		const mappingDescription = this.getMappingDescription(
			sourceAuthors.length,
			totalUsers,
			targetTitle,
			sourceType
		);
		const posts = importerStatus?.customData?.postsNumber || 0;
		const pages = importerStatus?.customData?.pagesNumber || 0;
		const attachments = importerStatus?.customData?.attachmentsNumber || 0;
		const unsupportedFilesMessage = this.getUnsupportedFilesMessage();

		return (
			<div className="importer__mapping-pane">
				{ unsupportedFilesMessage && (
					<Notice status="warning" className="importer__notice" isDismissible={ false }>
						{ unsupportedFilesMessage }
					</Notice>
				) }
				<Notice status="success" className="importer__notice" isDismissible={ false }>
					<p>{ this.props.translate( 'All set! We’ve found:' ) }</p>
					<div className="importer__notice-stats">
						{ posts > 0 && (
							<SummaryStat
								count={ posts }
								label={ this.props.translate( 'Posts' ) }
								icon={ verse }
							/>
						) }
						{ pages > 0 && (
							<SummaryStat
								count={ pages }
								label={ this.props.translate( 'Pages' ) }
								icon={ page }
							/>
						) }
						{ attachments > 0 && (
							<SummaryStat
								count={ attachments }
								label={ this.props.translate( 'Media items' ) }
								icon={ file }
							/>
						) }
					</div>
				</Notice>
				<h2>{ this.props.translate( 'Author mapping' ) }</h2>
				<div className="importer__mapping-description">{ mappingDescription }</div>
				<div className="importer__mapping-header">
					<span className="importer__mapping-source-title">{ sourceTitle }</span>
					<span className="importer__mapping-target-title">{ targetTitle }</span>
				</div>
				<div className="importer__mapping-authors">
					{ sourceAuthors.map( ( author ) => {
						return (
							<AuthorMapping
								hasSingleAuthor={ hasSingleAuthor }
								key={ 'author-mapping-' + author.id }
								onSelect={ ( e ) => onMap( author, e ) }
								siteId={ siteId }
								sourceAuthor={ author }
							/>
						);
					} ) }
				</div>
				<ImporterActionButtonContainer noSpacing>
					<ImporterActionButton primary disabled={ ! canStartImport } onClick={ onStartImport }>
						{ this.props.translate( 'Import' ) }
					</ImporterActionButton>
				</ImporterActionButtonContainer>
			</div>
		);
	}
}

const withTotalUsers = createHigherOrderComponent( ( Component ) => {
	const WithTotalUsers = ( props ) => {
		const { siteId } = props;
		const { data } = useUsersQuery( siteId, {
			authors_only: 1,
		} );

		const totalUsers = data?.total ?? 0;

		return <Component totalUsers={ totalUsers } { ...props } />;
	};
	WithTotalUsers.displayName = `WithTotalUsers(${
		Component.displayName || Component.name || 'Component'
	})`;
	return WithTotalUsers;
}, 'withTotalUsers' );

export default localize( withTotalUsers( AuthorMappingPane ) );
