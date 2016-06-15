/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import CountedTextarea from 'components/forms/counted-textarea';
import Gridicon from 'components/gridicon';
import InfoPopover from 'components/info-popover';
import TokenField from 'components/token-field';

function getSeoTabUrl( slug ) {
	return `/settings/seo/${ slug }`;
}

export default React.createClass( {
	displayName: 'EditorSeo',

	propTypes: {
		site: React.PropTypes.object.isRequired,
		post: React.PropTypes.object.isRequired
	},

	render() {
		const { slug } = this.props.site;

		// Temporary placeholder chips for design review
		const sampleChips = [ 'Post Title', 'Site Title' ];

		return (
			<Accordion
				title={ this.translate( 'Advanced SEO' ) }
				icon={ <Gridicon icon="search" /> }
				className="editor-drawer__seo"
			>
				<AccordionSection>
					<span className="editor-drawer__label-text">
						{ this.translate( 'Meta Title' ) }
						<InfoPopover position="top left">
							{ this.translate(
								'The format for the title as it will appear in search engines. ' +
								'{{a}}Edit{{/a}}',
								{
									components: {
										a: <a target="_blank" href={ getSeoTabUrl( slug ) } />
									}
								}
							) }
						</InfoPopover>
					</span>
					<TokenField value={ sampleChips } disabled={ true } />
				</AccordionSection>
				<AccordionSection>
					<span className="editor-drawer__label-text">
						{ this.translate( 'Meta Description' ) }
						<InfoPopover position="top left">
							{ this.translate(
								'Craft a description of your post in about 160 characters. ' +
								'This description can be used in search engine results.'
							) }
						</InfoPopover>
					</span>
					<CountedTextarea
						id="seo-meta-description"
						name="seo-meta-description"
						maxLength="300"
						acceptableLength={ 159 }
						placeholder={ this.translate( 'Write a description…' ) }
						aria-label={ this.translate( 'Write a description…' ) }
					/>
				</AccordionSection>
			</Accordion>
		);
	}
} );
