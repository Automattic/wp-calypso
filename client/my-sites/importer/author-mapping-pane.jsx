/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';
import AuthorMapping from './author-mapping-item';
import SiteUsersFetcher from 'components/site-users-fetcher';
import UsersStore from 'lib/users/store';

export default React.createClass( {
	displayName: 'ImporterMappingPane',

	mixins: [ PureRenderMixin ],

	propTypes: {
		hasSingleAuthor: PropTypes.bool.isRequired,
		onMap: PropTypes.func,
		onStartImport: PropTypes.func,
		siteId: PropTypes.number.isRequired,
		sourceAuthors: PropTypes.arrayOf(
			PropTypes.shape( {
				id: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired
			} ).isRequired
		).isRequired,
		sourceTitle: PropTypes.string.isRequired,
		targetTitle: PropTypes.string.isRequired
	},

	getFetchOptions( options = {} ) {
		return Object.assign( {
			number: 50,
			order: 'ASC',
			order_by: 'display_name',
			siteId: this.props.siteId
		}, options );
	},

	getMappingDescription( numSourceUsers, numTargetUsers, targetTitle ) {
		if ( numTargetUsers === 1 && numSourceUsers === 1 ) {
			return this.translate(
				'We found one author on your %(sourceType)s site. ' +
				'Because you\'re the only author on {{b}}%(destinationSiteTitle)s{{/b}}, ' +
				'all imported content will be assigned to you. ' +
				'Click Start Import to proceed.', {
					args: {
						sourceType: 'WordPress',
						destinationSiteTitle: targetTitle
					},
					components: {
						b: <strong />
					}
				}
			);
		} else if ( numTargetUsers === 1 && numSourceUsers > 1 ) {
			return this.translate(
				'We found multiple authors on your %(sourceType)s site. ' +
				'Because you\'re the only author on {{b}}%(destinationSiteTitle)s{{/b}}, ' +
				'all imported content will be assigned to you. ' +
				'Click Start Import to proceed.', {
					args: {
						sourceType: 'WordPress',
						destinationSiteTitle: targetTitle
					},
					components: {
						b: <strong />
					}
				}
			);
		} else if ( numTargetUsers > 1 && numSourceUsers === 1 ) {
			return this.translate(
				'We found multiple authors on {{b}}%(destinationSiteTitle)s{{/b}}. ' +
				'Please reassign the authors of the imported items to an existing ' +
				'user on {{b}}%(destinationSiteTitle)s{{/b}}, then click Start Import.', {
					args: {
						sourceType: 'WordPress',
						destinationSiteTitle: targetTitle
					},
					components: {
						b: <strong />
					}
				}
			);
		} else if ( numTargetUsers > 1 && numSourceUsers > 1 ) {
			return this.translate(
				'We found multiple authors on your %(sourceType)s site. ' +
				'Please reassign the authors of the imported items to an existing ' +
				'user on {{b}}%(destinationSiteTitle)s{{/b}}, then click Start Import.', {
					args: {
						sourceType: 'WordPress',
						destinationSiteTitle: targetTitle
					},
					components: {
						b: <strong />
					}
				}
			);
		}
	},

	getUserCount() {
		const fetchOptions = this.getFetchOptions( 50 );
		const { totalUsers } = UsersStore.getPaginationData( fetchOptions );

		return totalUsers;
	},

	render: function() {
		const { hasSingleAuthor, sourceAuthors, sourceTitle, targetTitle, onMap, onStartImport, siteId } = this.props;
		const canStartImport = hasSingleAuthor || sourceAuthors.some( author => author.mappedTo );
		const targetUserCount = this.getUserCount();
		const mappingDescription = this.getMappingDescription( sourceAuthors.length, targetUserCount, targetTitle );

		return (
			<div className="importer__mapping-pane">
				<SiteUsersFetcher fetchOptions={ this.getFetchOptions( { number: 50 } ) }>
					<div className="importer__mapping-description">
						{ mappingDescription }
					</div>
				</SiteUsersFetcher>
				<div className="importer__mapping-header">
					<span className="importer__mapping-source-title">{ sourceTitle }</span>
					<span className="importer__mapping-target-title">{ targetTitle }</span>
				</div>
				{ sourceAuthors.map( author => {
					return (
						<AuthorMapping
							hasSingleAuthor={ hasSingleAuthor }
							key={ 'author-mapping-' + author.id }
							onSelect={ e => onMap( author, e ) }
							siteId={ siteId }
							sourceAuthor={ author }
						/>
					);
				} ) }
				<Button disabled={ ! canStartImport } onClick={ onStartImport }>
					{ this.translate( 'Start Import' ) }
				</Button>
			</div>
		);
	}
} );
