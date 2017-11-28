/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import Gridicon from 'gridicons';

class EditorRevisionsLegacyLink extends PureComponent {
	static propTypes = {
		adminUrl: PropTypes.string,
		revisionsFromPostObj: PropTypes.array,

		//localize
		translate: PropTypes.func,
	};

	static defaultProps = {
		revisionsFromPostObj: [],
	};

	render() {
		const { adminUrl, translate, revisionsFromPostObj } = this.props;
		const lastRevisionId = get( revisionsFromPostObj, 0, 0 );

		if ( ! ( adminUrl && lastRevisionId ) ) {
			return null;
		}
		const revisionsLink = adminUrl + 'revision.php?revision=' + lastRevisionId;

		return (
			<a
				className="editor-revisions__wpadmin-link"
				href={ revisionsLink }
				target="_blank"
				rel="noopener noreferrer"
				aria-label={ translate( 'Open list of revisions' ) }
			>
				<Gridicon icon="history" size={ 18 } />
				{ translate( '%(revisions)d revision', '%(revisions)d revisions', {
					count: revisionsFromPostObj.length,
					args: { revisions: revisionsFromPostObj.length },
				} ) }
			</a>
		);
	}
}

export default localize( EditorRevisionsLegacyLink );
