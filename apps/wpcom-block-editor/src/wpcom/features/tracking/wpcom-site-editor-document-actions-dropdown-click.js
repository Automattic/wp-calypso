import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom-site-editor-document-actions-dropdown-clicks`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export const wpcomSiteEditorDocumentActionsDropdownOpen = () => ( {
	id: 'wpcom-site-editor-document-actions-dropdown-open',
	selector: '.components-dropdown .edit-site-document-actions__get-info',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_site_editor_document_actions_dropdown_open' ),
} );

/**
 * Return the event definition object to track `wpcom-site-editor-document-actions-template-area-click`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export const wpcomSiteEditorDocumentActionsTemplateAreaClick = () => ( {
	id: 'wpcom-site-editor-document-actions-template-area-click',
	selector: '.components-dropdown__content .edit-site-template-details__template-areas',
	type: 'click',
	handler: ( event ) => {
		const headerSVGSnippet =
			'M18.5 10.5H10v8h8a.5.5 0 00.5-.5v-7.5zm-10 0h-3V18a.5.5 0 00.5.5h2.5v-8zM6';
		const footerSVGSnippet =
			'M18 5.5h-8v8h8.5V6a.5.5 0 00-.5-.5zm-9.5 8h-3V6a.5.5 0 01.5-.5h2.5v8zM6';

		// There are no selectors that provide a distinction between the Header and Footer template
		// area buttons. We could use text content instead, but that information is unreliable when
		// the text is translated. Because of this, we look for accompanying SVG icons and derive
		// information from that instead.

		// The buttons have an icon AND text content. The user may click on either element. We check
		// for both possibilities here.
		const targetHTML = event.target.innerHTML;
		const previousElementSiblingHTML = event.target?.previousElementSibling?.innerHTML;

		if (
			previousElementSiblingHTML?.includes( headerSVGSnippet ) ||
			targetHTML?.includes( headerSVGSnippet )
		) {
			tracksRecordEvent( 'wpcom_site_editor_document_actions_template_area_click', {
				template_area: 'Header',
			} );
		} else if (
			previousElementSiblingHTML?.includes( footerSVGSnippet ) ||
			targetHTML?.includes( footerSVGSnippet )
		) {
			tracksRecordEvent( 'wpcom_site_editor_document_actions_template_area_click', {
				template_area: 'Footer',
			} );
		}
	},
} );

/**
 * Return the event definition object to track `wpcom-site-editor-document-actions-show-all-click`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export const wpcomSiteEditorDocumentActionsShowAllClick = () => ( {
	id: 'wpcom-site-editor-document-actions-show-all-click',
	selector: '.components-dropdown__content .edit-site-template-details__show-all-button',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_site_editor_document_actions_show_all_click' ),
} );
