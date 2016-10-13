/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default React.createClass( {

	displayName: 'EditorRevisions',

	mixins: [ PureRenderMixin ],

	propTypes: {
		adminUrl: React.PropTypes.string,
		revisions: React.PropTypes.array
	},

	getDefaultProps() {
		return {
			revisions: []
		};
	},

	render() {
		if ( ! this.props.revisions.length ) {
			return null;
		}

		const lastRevision = this.props.revisions[0];
		const revisionsLink = this.props.adminUrl + 'revision.php?revision=' + lastRevision;

		return (
			<a className="editor-revisions"
				href={ revisionsLink }
				target="_blank"
				rel="noopener noreferrer"
				aria-label={ this.translate( 'Open list of revisions' ) }
			>
				<Gridicon icon="history" size={ 18 } />
				{ this.translate(
					'%(revisions)d revision',
					'%(revisions)d revisions', {
						count: this.props.revisions.length,
						args: {
							revisions: this.props.revisions.length
						}
					}
				) }
			</a>
		);
	}
} );
