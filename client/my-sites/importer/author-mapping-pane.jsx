/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import AuthorMapping from './author-mapping-item';
import ImporterActionButtonContainer from 'calypso/my-sites/importer/importer-action-buttons/container';
import ImporterActionButton from 'calypso/my-sites/importer/importer-action-buttons/action-button';
import ImporterCloseButton from 'calypso/my-sites/importer/importer-action-buttons/close-button';
import useUsersQuery from 'calypso/data/users/use-users-query';

/**
 * Style dependencies
 */
import './author-mapping-pane.scss';

class AuthorMappingPane extends React.PureComponent {
	static displayName = 'AuthorMappingPane';

	static propTypes = {
		hasSingleAuthor: PropTypes.bool.isRequired,
		onMap: PropTypes.func,
		onStartImport: PropTypes.func,
		siteId: PropTypes.number.isRequired,
		sourceAuthors: PropTypes.arrayOf(
			PropTypes.shape( {
				id: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired,
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
					'Click Start import to proceed.',
				{
					args: {
						sourceType: sourceType,
						destinationSiteTitle: targetTitle,
					},
					components: {
						b: <strong />,
					},
				}
			);
		} else if ( numTargetUsers === 1 && numSourceUsers > 1 ) {
			return this.props.translate(
				'There are multiple authors on your %(sourceType)s site. ' +
					"Because you're the only author on {{b}}%(destinationSiteTitle)s{{/b}}, " +
					'all imported content will be assigned to you. ' +
					'Click {{em}}Start import{{/em}} to proceed.',
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
					'user on {{b}}%(destinationSiteTitle)s{{/b}}, then click {{em}}Start import{{/em}}.',
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
					'user on {{b}}%(destinationSiteTitle)s{{/b}}, then click {{em}}Start import{{/em}}.',
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

	render() {
		const {
			hasSingleAuthor,
			sourceAuthors,
			sourceTitle,
			targetTitle,
			onMap,
			onStartImport,
			siteId,
			sourceType,
			importerStatus,
			site,
			totalUsers,
		} = this.props;
		const canStartImport = hasSingleAuthor || sourceAuthors.every( ( author ) => author.mappedTo );
		const mappingDescription = this.getMappingDescription(
			sourceAuthors.length,
			totalUsers,
			targetTitle,
			sourceType
		);

		return (
			<div className="importer__mapping-pane">
				<div className="importer__mapping-description">{ mappingDescription }</div>
				<div className="importer__mapping-header">
					<span className="importer__mapping-source-title">{ sourceTitle }</span>
					<span className="importer__mapping-target-title">{ targetTitle }</span>
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
						{ this.props.translate( 'Start import' ) }
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
		const { data } = useUsersQuery( siteId );

		const totalUsers = data?.total ?? 0;

		return <Component totalUsers={ totalUsers } { ...props } />;
	},
	'withTotalUsers'
);

export default localize( withTotalUsers( AuthorMappingPane ) );
