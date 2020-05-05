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
import EditorDrawerLabel from 'post-editor/editor-drawer/label';
import AccordionSection from 'components/accordion/section';
import Slug from 'post-editor/editor-slug';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';

/**
 * Style dependencies
 */
import './slug.scss';

class EditorMoreOptionsSlug extends PureComponent {
	static propTypes = {
		postType: PropTypes.string,
		translate: PropTypes.func,
	};

	getPopoverLabel() {
		const { translate, postType } = this.props;
		if ( 'page' === postType ) {
			return translate(
				"The slug is the part of a web address that identifies a specific page within a site. It's often based on the page title."
			);
		}

		return translate(
			"The slug is the part of a web address that identifies a specific post within a site. It's often based on the post title."
		);
	}

	render() {
		const { postType, translate } = this.props;

		return (
			<AccordionSection className="editor-more-options__slug">
				<EditorDrawerLabel labelText={ translate( 'Slug' ) } helpText={ this.getPopoverLabel() } />
				<Slug instanceName={ postType + '-sidebar' } className="editor-more-options__slug-field" />
			</AccordionSection>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		postType: getEditedPostValue( state, siteId, getEditorPostId( state ), 'type' ),
	};
} )( localize( EditorMoreOptionsSlug ) );
