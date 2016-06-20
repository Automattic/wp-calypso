/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import CountedTextarea from 'components/forms/counted-textarea';
import Gridicon from 'components/gridicon';
import InfoPopover from 'components/info-popover';
import TokenField from 'components/token-field';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';

class EditorSeoAccordion extends Component {
	render() {
		const { translate } = this.props;
		// Temporary placeholder chips for design review
		const sampleChips = [ 'Post Title', 'Site Title' ];

		const seoTabUrl = `/settings/seo/${ this.props.siteSlug }`;

		return (
			<Accordion
				title={ translate( 'Advanced SEO' ) }
				icon={ <Gridicon icon="search" /> }
				className="editor-seo-accordion"
			>
				<AccordionSection>
					<span className="editor-drawer__label-text">
						{ translate( 'Meta Title' ) }
						<InfoPopover position="top left">
							{ translate(
								'To edit the format of the meta title, go to your site\'s {{a}}SEO settings{{/a}}.',
								{
									components: {
										a: <a target="_blank" href={ seoTabUrl } />
									}
								}
							) }
						</InfoPopover>
					</span>
					<TokenField value={ sampleChips } disabled />
				</AccordionSection>
				<AccordionSection>
					<span className="editor-drawer__label-text">
						{ translate( 'Meta Description' ) }
						<InfoPopover position="top left">
							{ translate(
								'Craft a description of your post for search engine results. ' +
								'The post content is used by default.'
							) }
						</InfoPopover>
					</span>
					<CountedTextarea
						maxLength="300"
						acceptableLength={ 159 }
						placeholder={ translate( 'Write a description…' ) }
						aria-label={ translate( 'Write a description…' ) }
					/>
				</AccordionSection>
			</Accordion>
		);
	}
}

EditorSeoAccordion.propTypes = {
	translate: PropTypes.func,
	siteSlug: PropTypes.string
};

const mapStateToProps = ( state ) => ( {
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) )
} );

export default connect( mapStateToProps )( localize( EditorSeoAccordion ) );
