import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Notice } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import useUsersQuery from 'calypso/data/users/use-users-query';
import AuthorMapping from 'calypso/my-sites/importer/author-mapping-item';
import ImporterActionButton from 'calypso/my-sites/importer/importer-action-buttons/action-button';
import ImporterActionButtonContainer from 'calypso/my-sites/importer/importer-action-buttons/container';

import './author-mapping-pane.scss';

function getNoticeContent( postsNumber, pagesNumber, attachmentsNumber ) {
	if ( postsNumber > 0 && pagesNumber > 0 && attachmentsNumber > 0 ) {
		return (
			<>
				All set! We’ve found <strong>{ postsNumber } posts</strong>,{ ' ' }
				<strong>{ pagesNumber } pages</strong>
				and <strong>{ attachmentsNumber } media</strong> to import.
			</>
		);
	}

	if ( postsNumber > 0 && pagesNumber > 0 ) {
		return (
			<>
				All set! We’ve found <strong>{ postsNumber } posts</strong> and{ ' ' }
				<strong>{ pagesNumber } pages</strong> to import.
			</>
		);
	}

	if ( postsNumber > 0 && attachmentsNumber > 0 ) {
		return (
			<>
				All set! We’ve found <strong>{ postsNumber } posts</strong> and{ ' ' }
				<strong>{ attachmentsNumber } media</strong> to import.
			</>
		);
	}

	if ( pagesNumber > 0 && attachmentsNumber > 0 ) {
		return (
			<>
				All set! We’ve found <strong>{ pagesNumber } pages</strong> and{ ' ' }
				<strong>{ attachmentsNumber } media</strong> to import.
			</>
		);
	}

	if ( postsNumber > 0 ) {
		return (
			<>
				All set! We’ve found <strong>{ postsNumber } posts</strong> to import.
			</>
		);
	}

	if ( pagesNumber > 0 ) {
		return (
			<>
				All set! We’ve found <strong>{ pagesNumber } pages</strong> to import.
			</>
		);
	}

	if ( attachmentsNumber > 0 ) {
		return (
			<>
				All set! We’ve found <strong>{ attachmentsNumber } media</strong> to import.
			</>
		);
	}
}

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

		return (
			<div className="importer__mapping-pane">
				<Notice status="success" className="importer__notice" isDismissible={ false }>
					{ getNoticeContent(
						importerStatus?.customData?.postsNumber || 0,
						importerStatus?.customData?.pagesNumber || 0,
						importerStatus?.customData?.attachmentsNumber || 0
					) }
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

const withTotalUsers = createHigherOrderComponent(
	( Component ) => ( props ) => {
		const { siteId } = props;
		const { data } = useUsersQuery( siteId, {
			authors_only: 1,
		} );

		const totalUsers = data?.total ?? 0;

		return <Component totalUsers={ totalUsers } { ...props } />;
	},
	'withTotalUsers'
);

export default localize( withTotalUsers( AuthorMappingPane ) );
