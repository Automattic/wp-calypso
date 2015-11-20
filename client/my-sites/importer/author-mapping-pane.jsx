/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';
import AuthorMapping from './author-mapping-item';

export default React.createClass( {
	displayName: 'ImporterMappingPane',

	mixins: [ React.addons.PureRenderMixin ],

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

	render: function() {
		const { hasSingleAuthor, sourceAuthors, sourceTitle, targetTitle, onMap, onStartImport, siteId } = this.props;
		const canStartImport = hasSingleAuthor || sourceAuthors.some( author => author.mappedTo );

		return (
			<div className="importer__mapping-pane">
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
