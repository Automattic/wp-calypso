/**
 * External dependencies
 */

import React from 'react';
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
	onEdit() {
		alert( 'You clicked the Edit button 😊' );
	}

	onDelete() {
		alert( 'You clicked the Delete button 😊' );
	}

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
				<Button primary onClick={ this.onEdit }>
					{ translate( 'Edit' ) }
				</Button>
				<Button scary onClick={ this.onDelete }>
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
