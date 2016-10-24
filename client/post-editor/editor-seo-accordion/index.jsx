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
import PostActions from 'lib/posts/actions';
import EditorDrawerLabel from 'post-editor/editor-drawer/label';

function EditorSeoAccordion( { translate, metaDescription = '' } ) {
	return (
		<Accordion
			title={ translate( 'Advanced SEO' ) }
			icon={ <Gridicon icon="search" /> }
			className="editor-seo-accordion"
		>
			<AccordionSection>
				<EditorDrawerLabel
					helpText={ translate(
						'Craft a description of your post for search engine results. ' +
						'The post content is used by default.'
					) }
					labelText={ translate( 'Meta Description' ) }
				>
					<CountedTextarea
						maxLength="300"
						acceptableLength={ 159 }
						placeholder={ translate( 'Write a description…' ) }
						aria-label={ translate( 'Write a description…' ) }
						value={ metaDescription }
						onChange={ onMetaChange }
					/>
				</EditorDrawerLabel>
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
