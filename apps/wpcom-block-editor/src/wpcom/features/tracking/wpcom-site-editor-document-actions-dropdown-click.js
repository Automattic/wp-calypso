import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom-site-editor-document-actions-dropdown-clicks`.
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
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export const wpcomSiteEditorDocumentActionsTemplateAreaClick = () => ( {
	id: 'wpcom-site-editor-document-actions-template-area-click',
	selector: '.components-dropdown__content .edit-site-template-details__template-areas',
	type: 'click',
	handler: ( event ) => {
		// There are no selectors that provide a distinction between the Header and Footer template
		// area buttons. Because of this, we look at accompanying SVG icons to differentiate
		// instead.
		const headerSVGSnippet =
			'M18.5 10.5H10v8h8a.5.5 0 00.5-.5v-7.5zm-10 0h-3V18a.5.5 0 00.5.5h2.5v-8zM6';
		const footerSVGSnippet =
			'M18 5.5h-8v8h8.5V6a.5.5 0 00-.5-.5zm-9.5 8h-3V6a.5.5 0 01.5-.5h2.5v8zM6';
		const moreSVGSnippet = 'M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z';

		// Looking at the target is not enough. Some buttons have an icon AND text content. We only
		// care about the icon, but the user may click on either element. We check for both
		// possibilities here when clicking on Header or Footer.
		const targetHTML = event.target.innerHTML;
		const previousElementSiblingHTML = event.target?.previousElementSibling?.innerHTML;

		if (
			previousElementSiblingHTML?.includes( headerSVGSnippet ) ||
			targetHTML?.includes( headerSVGSnippet )
		) {
			tracksRecordEvent( 'wpcom_site_editor_document_actions_template_area_click', {
				template_area: 'header',
			} );
		} else if (
			previousElementSiblingHTML?.includes( footerSVGSnippet ) ||
			targetHTML?.includes( footerSVGSnippet )
		) {
			tracksRecordEvent( 'wpcom_site_editor_document_actions_template_area_click', {
				template_area: 'footer',
			} );
		} else if ( targetHTML?.includes( moreSVGSnippet ) ) {
			tracksRecordEvent( 'wpcom_site_editor_document_actions_template_area_click', {
				template_area: 'more_options',
			} );
		} else {
			tracksRecordEvent( 'wpcom_site_editor_document_actions_template_area_click', {
				template_area: 'unknown',
			} );
		}
	},
} );

/**
 * Return the event definition object to track `wpcom-site-editor-document-actions-template-areas-item-more`.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export const wpcomSiteEditorDocumentActionsRevertClick = () => ( {
	id: 'wpcom-site-editor-document-actions-revert-click',
	selector: '.components-dropdown__content .edit-site-template-details__revert',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_site_editor_document_actions_revert_click' ),
} );

/**
 * Return the event definition object to track `wpcom-site-editor-document-actions-show-all-click`.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export const wpcomSiteEditorDocumentActionsShowAllClick = () => ( {
	id: 'wpcom-site-editor-document-actions-show-all-click',
	selector: '.components-dropdown__content .edit-site-template-details__show-all-button',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_site_editor_document_actions_show_all_click' ),
} );
