import { ElementHandle, Frame, Page } from 'playwright';

export interface BlockFlow {
	blockSidebarName: string;
	blockEditorSelector: string;
	configure( editorContext: EditorContext ): Promise< void >;
	validateAfterPublish( page: Page ): Promise< void >;
}

export interface EditorContext {
	page: Page;
	editorIframe: Frame;
	blockHandle: ElementHandle;
}
