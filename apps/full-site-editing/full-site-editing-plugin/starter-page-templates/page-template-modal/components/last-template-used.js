/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
/**
 * Internal dependencies
 */
import TemplateSelectorItem from './template-selector-item';
import replacePlaceholders from '../utils/replace-placeholders';
import '../../../../../../client/landing/gutenboarding/stores/verticals-templates'; // Should be @automattic/stores/vertical-templates
/* eslint-enable import/no-extraneous-dependencies */

class LastTemplateUsedComponent extends Component {
	getLastTemplateUsed = () => {
		const { isFrontPage, templates, theme } = this.props;
		let { lastTemplateUsedSlug } = this.props;
		// Try to match the homepage of the theme. Note that as folks transition
		// to using the slug-based version of the homepage (e.g. "shawburn"), the
		// slug will work normally without going through this check.
		if ( ! lastTemplateUsedSlug && isFrontPage ) {
			lastTemplateUsedSlug = theme;
		}

		if ( ! lastTemplateUsedSlug || lastTemplateUsedSlug === 'blank' ) {
			// If no template used or 'blank', preview any other template (1 is currently 'Home' template).
			return templates[ 0 ];
		}
		const matchingTemplate = templates.find( temp => temp.slug === lastTemplateUsedSlug );
		// If no matching template, return the blank template.
		if ( ! matchingTemplate ) {
			return templates[ 0 ];
		}
		return matchingTemplate;
	};

	render() {
		if ( ! this.props.template ) {
			return null;
		}

		const { slug, title, preview, previewAlt } = this.getLastTemplateUsed();

		return (
			<TemplateSelectorItem
				id="sidebar-modal-opener__last-template-used-preview"
				value={ slug }
				label={ replacePlaceholders( title, this.props.siteInformation ) }
				staticPreviewImg={ preview }
				staticPreviewImgAlt={ previewAlt }
				onSelect={ this.toggleWarningModal }
			/>
		);
	}
}

const LastTemplateUsed = compose(
	withSelect( ( select, ownProps ) => ( {
		lastTemplateUsedSlug: select( 'core/editor' ).getEditedPostAttribute( 'meta' )
			._starter_page_template,
		templates: select( 'automattic/verticals/templates' ).getTemplates( ownProps.vertical.id ),
	} ) )
)( LastTemplateUsedComponent );

export default LastTemplateUsed;
