/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EditorDrawerLabel from 'client/post-editor/editor-drawer/label';
import AccordionSection from 'client/components/accordion/section';
import Slug from 'client/post-editor/editor-slug';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { getEditorPostId } from 'client/state/ui/editor/selectors';
import { getEditedPostValue } from 'client/state/posts/selectors';

class EditorMoreOptionsSlug extends PureComponent {
	static propTypes = {
		postType: PropTypes.string,
		translate: PropTypes.func,
	};

	getPopoverLabel() {
		const { translate, postType } = this.props;
		if ( 'page' === postType ) {
			return translate( 'The slug is the URL-friendly version of the page title.' );
		}

		return translate( 'The slug is the URL-friendly version of the post title.' );
	}

	render() {
		const { postType, translate } = this.props;

		return (
			<AccordionSection className="editor-more-options__slug">
				<EditorDrawerLabel labelText={ translate( 'Slug' ) } helpText={ this.getPopoverLabel() }>
					<Slug
						instanceName={ postType + '-sidebar' }
						className="editor-more-options__slug-field"
					/>
				</EditorDrawerLabel>
			</AccordionSection>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		postType: getEditedPostValue( state, siteId, getEditorPostId( state ), 'type' ),
	};
} )( localize( EditorMoreOptionsSlug ) );
