/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';
import AuthorMapping from './author-mapping-item';
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

	getUserCount() {
		const { totalUsers } = UsersStore.getPaginationData( {
			siteId: this.props.siteId,
			order: 'ASC',
			order_by: 'display_name',
			number: 50
		} );

		return totalUsers;
	},

	render: function() {
		const { hasSingleAuthor, sourceAuthors, sourceTitle, targetTitle, onMap, onStartImport, siteId } = this.props;
		const canStartImport = hasSingleAuthor || sourceAuthors.some( author => author.mappedTo );
		const targetUserCount = this.getUserCount();
		console.log( targetUserCount );
		const mappingDescription = targetUserCount === 1
			? this.translate(
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
			  } )
			: this.translate(
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
			  } );

		return (
			<div className="importer__mapping-pane">
				<div className="importer__mapping-description">
					{ mappingDescription }
				</div>
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
