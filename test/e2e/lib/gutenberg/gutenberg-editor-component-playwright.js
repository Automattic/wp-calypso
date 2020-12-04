export default class GutenbergEditorComponent {
    constructor( page ) {
        // Selectors
        this.editorFrame = '.main > iframe:nth-child(1)';
        this.toggleBlockInserter = '.edit-post-header .edit-post-header-toolbar__inserter-toggle';

        this.page = page;
        // Tries the best to make sure the editor iframe is loaded and able to be selected
        // prior to continuing the tests.
        this._init();
    }

    async _init() {
        // Completes the initialization of the GutenbergEditorComponent class.
        // This is a workaround since constructors do not permit async calls, but the 
        // editor frame needs to finish loading in order for the selectors to function.
        await this.page.waitForSelector( this.editorFrame );
        const handle = await this.page.$( this.editorFrame );
        // Selects the editor block iframe, with which all block related operations are
        // called from.
        // To avoid this, it is possible to call page.frame(name or url) instead.
        this.frame = await handle.contentFrame();
    }

    async openBlockInserter() {    
        await this.frame.waitForSelector( this.toggleBlockInserter );
        return await this.frame.click( this.toggleBlockInserter );
    }

    async searchBlock( blockName ) {
        const inserterBlockSearch = 'input.block-editor-inserter__search-input';

        await this.frame.waitForSelector( inserterBlockSearch );
        await this.frame.focus( inserterBlockSearch );
        return await this.frame.fill( inserterBlockSearch, blockName );
    }

    async addBlock( blockName ) {
        const blockSelector = `text="${ blockName }"`;

        await this.frame.waitForSelector( blockSelector );
        return await this.frame.click( blockSelector );
    }

    async fillText( blockSelector, text ) {
        const frame = this.frame;

        await frame.waitForSelector( blockSelector );
        await frame.focus( blockSelector );
        return await frame.fill( blockSelector, text );
    }

    async uploadFile( blockSelector, fileInputSelector, file ) {
        await this.frame.waitForSelector( blockSelector );
        return await this.frame.setInputFiles( fileInputSelector, file );
    }

    async saveDraft() {
        const frame = this.frame;
        const saveDraftButton = '.editor-post-save-draft';
        const savedConfirmSelector = 'span.is-saved';

        await frame.waitForSelector( saveDraftButton );
        await frame.click( saveDraftButton );
        return await frame.waitForSelector( savedConfirmSelector );
    }

    async publishPost() {
        const frame = this.frame;
        const prePublishButtonSelector = '.editor-post-publish-panel__toggle';
        const publishSelector = '.editor-post-publish-panel__header-publish-button button.editor-post-publish-button';

        await frame.waitForSelector( prePublishButtonSelector );
        await frame.click( prePublishButtonSelector );
        await frame.waitForSelector( publishSelector );
        return await frame.click( publishSelector );
    }

    async confirmPostPublished() {
        const snackBarNotice = '.components-snackbar';
        
        await this.frame.waitForSelector( snackBarNotice );
    }

    async visitPublishedPost() {
        const snackBarNoticeLinkSelector = '.components-snackbar__content a';

        // page.waitForNavigation will resolve if a new URL is loaded.
        this.page.waitForNavigation();
        return await this.frame.click( snackBarNoticeLinkSelector );
    }
}