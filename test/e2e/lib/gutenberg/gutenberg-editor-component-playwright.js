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
        await this.page.waitForSelector( this.editorFrame );
        const handle = await this.page.$( this.editorFrame );
        this.frame = await handle.contentFrame();
    }

    async openBlockInserter() {
        const frame = this.frame;
    
        await frame.waitForSelector( this.toggleBlockInserter );
        return await frame.click( this.toggleBlockInserter );
    }

    async searchBlock( blockName ) {
        const frame = this.frame;
        const inserterBlockSearch = 'input.block-editor-inserter__search-input';

        await frame.waitForSelector( inserterBlockSearch );
        await frame.focus( inserterBlockSearch );
        return await frame.fill( inserterBlockSearch, blockName );
    }

    async addBlock( blockName ) {
        const frame = this.frame;
        const blockSelector = `text="${ blockName }"`;

        await frame.waitForSelector( blockSelector );
        return await frame.click( blockSelector );
    }

    async fillText( blockSelector, text ) {
        const frame = this.frame;

        await frame.waitForSelector( blockSelector );
        await frame.focus( blockSelector );
        return await frame.fill( blockSelector, text );
    }

    async uploadFile( blockSelector, fileInputSelector, file ) {
        const frame = this.frame;

        await frame.waitForSelector( blockSelector );
        return await frame.setInputFiles( fileInputSelector, file );
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
        const frame = this.frame;
        const snackBarNotice = '.components-snackbar';
        
        await frame.waitForSelector( snackBarNotice );
    }

    async visitPublishedPost() {
        const page = this.page;
        const frame = this.frame;
        const snackBarNoticeLinkSelector = '.components-snackbar__content a';

        // page.waitForNavigation will resolve if a new URL is loaded.
        page.waitForNavigation();
        return await frame.click( snackBarNoticeLinkSelector );
    }
}