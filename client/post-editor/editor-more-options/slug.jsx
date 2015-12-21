/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import AccordionSection from 'components/accordion/section';
import InfoPopover from 'components/info-popover';
import Slug from 'post-editor/editor-slug';

export default React.createClass( {
	displayName: 'EditorMoreOptionsSlug',

	mixins: [ PureRenderMixin ],

	propTypes: {
		slug: PropTypes.string,
		type: PropTypes.string
	},

	getPopoverLabel() {
		if ( 'page' === this.props.type ) {
			return this.translate( 'The slug is the URL-friendly version of the page title.' );
		}

		return this.translate( 'The slug is the URL-friendly version of the post title.' );
	},

	render() {
		const { slug, type } = this.props;

		return (
			<AccordionSection className="editor-more-options__slug">
				<div className="editor-drawer__label-text">
					{ this.translate( 'Slug' ) }
					<InfoPopover position="top left">
						{ this.getPopoverLabel() }
					</InfoPopover>
				</div>
				<Slug
					slug={ slug }
					instanceName={ type + '-sidebar' }
					className="editor-more-options__slug-field" />
			</AccordionSection>
		);
	}
} );
