/**
 * External dependencies
 */

import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import Count from 'components/count';
import Button from 'components/button';
import Card from 'components/card';
import { localize } from 'i18n-calypso';
import { isEnabled } from 'config';
import {
	isMultiSelectEnabled,
	getSelectedPostsCount,
} from 'state/ui/post-type-list/selectors';

class PostTypeBulkEditBar extends React.Component {
	render() {
		if ( ! isEnabled( 'posts/post-type-list/bulk-edit' ) ) {
			return null;
		}

		const {
			multiSelectEnabled,
			selectedPostsCount,
			translate,
		} = this.props;

		if ( ! multiSelectEnabled ) {
			return null;
		}

		return (
			<Card className="post-type-list__bulk-edit-bar">
				<FormCheckbox indeterminate />
				<Count count={ selectedPostsCount } />
				<Button primary onClick={ () => alert( '😊' ) }>
					{ translate( 'Edit' ) }
				</Button>
				<Button scary onClick={ () => alert( '😊' ) }>
					{ translate( 'Delete' ) }
				</Button>
			</Card>
		);
	}
}

export default connect(
	( state ) => {
		return {
			multiSelectEnabled: isMultiSelectEnabled( state ),
			selectedPostsCount: getSelectedPostsCount( state ),
		};
	}
)( localize( PostTypeBulkEditBar ) );
