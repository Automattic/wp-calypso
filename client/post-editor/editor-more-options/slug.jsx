/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EditorDrawerLabel from 'post-editor/editor-drawer/label';
import AccordionSection from 'components/accordion/section';
import Slug from 'post-editor/editor-slug';

class EditorMoreOptionsSlug extends PureComponent {
	static propTypes = {
		slug: PropTypes.string,
		type: PropTypes.string,
		translate: PropTypes.func
	};

	getPopoverLabel() {
		const { translate } = this.props;
		if ( 'page' === this.props.type ) {
			return translate( 'The slug is the URL-friendly version of the page title.' );
		}

		return translate( 'The slug is the URL-friendly version of the post title.' );
	}

	render() {
		const { slug, type, translate } = this.props;

		return (
			<AccordionSection className="editor-more-options__slug">
				<EditorDrawerLabel labelText={ translate( 'Slug' ) } helpText={ this.getPopoverLabel() }>
					<Slug
						slug={ slug }
						instanceName={ type + '-sidebar' }
						className="editor-more-options__slug-field" />
				</EditorDrawerLabel>
			</AccordionSection>
		);
	}
}

export default localize( EditorMoreOptionsSlug );
