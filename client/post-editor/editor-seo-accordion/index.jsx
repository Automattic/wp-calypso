/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import CountedTextarea from 'components/forms/counted-textarea';
import Gridicon from 'components/gridicon';
import InfoPopover from 'components/info-popover';
import PostActions from 'lib/posts/actions';

function EditorSeoAccordion( { translate, metaDescription = '' } ) {
	return (
		<Accordion
			title={ translate( 'Advanced SEO' ) }
			icon={ <Gridicon icon="search" /> }
			className="editor-seo-accordion"
		>
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
					value={ metaDescription }
					onChange={ onMetaChange }
				/>
			</AccordionSection>
		</Accordion>
	);
}

function onMetaChange( event ) {
	PostActions.updateMetadata( {
		advanced_seo_description: event.target.value
	} );
}

EditorSeoAccordion.propTypes = {
	translate: PropTypes.func,
	metaDescription: PropTypes.string
};

export default localize( EditorSeoAccordion );
