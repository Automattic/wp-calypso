import { recordTracksEvent } from '@automattic/calypso-analytics';
import { createHigherOrderComponent } from '@wordpress/compose';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import useUsersQuery from 'calypso/data/users/use-users-query';
import ImporterActionButton from 'calypso/my-sites/importer/importer-action-buttons/action-button';
import ImporterCloseButton from 'calypso/my-sites/importer/importer-action-buttons/close-button';
import ImporterActionButtonContainer from 'calypso/my-sites/importer/importer-action-buttons/container';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import AuthorMapping from './author-mapping-item';

import './author-mapping-pane.scss';

class AuthorMappingPane extends PureComponent {
	static displayName = 'AuthorMappingPane';

	static propTypes = {
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

	getMappingDescription = ( numSourceUsers, numTargetUsers, siteDomain, sourceType ) => {
		if ( numTargetUsers === 1 && numSourceUsers === 1 ) {
			// translators: Import is a call to action button.
			return this.props.translate(
				'There is one author on your original %(sourceType)s site. ' +
					"Because you're the only author on this site (%(siteDomain)s), " +
					'all imported content will be assigned to you. ' +
					'Click {{em}}Import{{/em}} to proceed.',
				{
					args: {
						sourceType: sourceType,
						siteDomain: siteDomain,
					},
					components: {
						em: <em />,
					},
				}
			);
		} else if ( numTargetUsers === 1 && numSourceUsers > 1 ) {
			// translators: Import is a call to action button.
			return this.props.translate(
				'There are multiple authors on your original %(sourceType)s site. ' +
					"Because you're the only author on this site (%(siteDomain)s), " +
					'all imported content will be assigned to you. ' +
					'Click {{em}}Import{{/em}} to proceed.',
				{
					args: {
						sourceType: sourceType,
						siteDomain: siteDomain,
					},
					components: {
						em: <em />,
					},
				}
			);
		} else if ( numTargetUsers > 1 && numSourceUsers === 1 ) {
			// translators: Import is a call to action button.
			return this.props.translate(
				'There are multiple authors on your site. ' +
					'Please reassign the authors of the imported items to an existing ' +
					'user on this site, then click {{em}}Import{{/em}}.',
				{
					args: {
						sourceType: 'WordPress',
					},
					components: {
						em: <em />,
					},
				}
			);
		} else if ( numTargetUsers > 1 && numSourceUsers > 1 ) {
			// translators: Import is a call to action button.
			return this.props.translate(
				'There are multiple authors on your original %(sourceType)s site. ' +
					'Please reassign the authors of the imported items to an existing ' +
					'user on this site (%(siteDomain)s), then click {{em}}Import{{/em}}.',
				{
					args: {
						sourceType: 'WordPress',
						siteDomain: siteDomain,
					},
					components: {
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
			sourceAuthors,
			onMap,
			onStartImport,
			siteId,
			sourceType,
			importerStatus,
			site,
			totalUsers,
			translate,
			siteDomain,
		} = this.props;

		const hasSingleAuthor = totalUsers === 1;
		const canStartImport = hasSingleAuthor || sourceAuthors.every( ( author ) => author.mappedTo );
		const mappingDescription = this.getMappingDescription(
			sourceAuthors.length,
			totalUsers,
			siteDomain,
			sourceType
		);

		return (
			<div className="importer__mapping-pane">
				<div className="importer__mapping-description">{ mappingDescription }</div>
				<div className="importer__mapping-header">
					<span className="importer__mapping-source-title">{ translate( 'Original Site' ) }</span>
					<span className="importer__mapping-target-title">
						{ translate( 'This Site (%(siteDomain)s)', {
							args: { siteDomain },
						} ) }
					</span>
				</div>
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
				<ImporterActionButtonContainer>
					<ImporterActionButton primary disabled={ ! canStartImport } onClick={ onStartImport }>
						{ this.props.translate( 'Import', {
							context:
								'The user is told that authors are automatically mapped or they need to map them manually and then click Import.',
						} ) }
					</ImporterActionButton>
					<ImporterCloseButton importerStatus={ importerStatus } site={ site } isEnabled />
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

export default connect( ( state, ownProps ) => ( {
	siteDomain: getSiteDomain( state, ownProps.siteId ),
} ) )( localize( withTotalUsers( AuthorMappingPane ) ) );
