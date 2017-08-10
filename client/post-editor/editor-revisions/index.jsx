/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

export default localize(class extends React.PureComponent {
    static displayName = 'EditorRevisions';

	static propTypes = {
		adminUrl: PropTypes.string,
		revisions: PropTypes.array
	};

	static defaultProps = {
		revisions: []
	};

	render() {
		if ( ! this.props.revisions || ! this.props.revisions.length ) {
			return null;
		}

		const lastRevision = this.props.revisions[ 0 ];
		const revisionsLink = this.props.adminUrl + 'revision.php?revision=' + lastRevision;

		return (
		    <a className="editor-revisions"
				href={ revisionsLink }
				target="_blank"
				rel="noopener noreferrer"
				aria-label={ this.props.translate( 'Open list of revisions' ) }
			>
				<Gridicon icon="history" size={ 18 } />
				{ this.props.translate(
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
});
