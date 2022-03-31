export * from './validate-translations';
export * from './get-test-account-by-feature';

// Other items are exported for unit testing, we only care about the manager class.
export { EditorTracksEventManager } from './editor-tracks-event-manager';
// Other items are exported for unit testing, we only care about this function.
export { hardCodeAtomicEditorRouting } from './editor-routing-overrides';
