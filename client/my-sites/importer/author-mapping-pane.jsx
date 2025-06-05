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

	getMappingDescription = ( numSourceUsers, numTargetUsers, siteDomain ) => {
		if ( numTargetUsers === 1 && numSourceUsers === 1 ) {
			return this.props.translate(
				"Your file is ready to be imported into {{strong}}%(siteDomain)s{{/strong}}. We'll assign you as the author of all imported content.",
				{
					args: {
						siteDomain: siteDomain,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		} else if ( numTargetUsers === 1 && numSourceUsers > 1 ) {
			return this.props.translate(
				"Your file is ready to be imported into {{strong}}%(siteDomain)s{{/strong}}. As you're the only author on the new site, we'll assign all imported content to you.",
				{
					args: {
						siteDomain: siteDomain,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		} else if ( numTargetUsers > 1 && numSourceUsers === 1 ) {
			return this.props.translate(
				"Your file is ready to be imported into {{strong}}%(siteDomain)s{{/strong}}. Please reassign content from your original site's author to a user on this site.",
				{
					args: {
						siteDomain: siteDomain,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		} else if ( numTargetUsers > 1 && numSourceUsers > 1 ) {
			return this.props.translate(
				"Your file is ready to be imported into {{strong}}%(siteDomain)s{{/strong}}. Please reassign content from your original site's authors to users on this site.",
				{
					args: {
						siteDomain: siteDomain,
					},
					components: {
						strong: <strong />,
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
			siteDomain
		);

		return (
			<div className="importer__mapping-pane">
				<div className="importer__mapping-description">{ mappingDescription }</div>
				<div className="importer__mapping-header">
					<span className="importer__mapping-source-title">{ translate( 'Original site' ) }</span>
					<span className="importer__mapping-target-title">{ translate( 'This site' ) }</span>
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
						{ this.props.translate( 'Import' ) }
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
