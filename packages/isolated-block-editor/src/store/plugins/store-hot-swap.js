/**
 * Swap any access to `core/block-editor` to the currently focussed editor store. This ensures that blocks that directly access
 * wp.data still work.
 *
 * Note that store plugins are currently marked as deprecated. It's unknown what will replace them, and this will need to be updated
 * once that happens.
 *
 * @param {object} registry
 * @param {object} pluginOptions
 */
function storeHotSwapPlugin( registry, pluginOptions ) {
	// Switch select and dispatch
	return {
		dispatch( reducerKey ) {
			if ( storeHotSwapPlugin.targetDispatch === null || reducerKey !== 'core/block-editor' ) {
				return registry.dispatch( reducerKey );
			}

			return storeHotSwapPlugin.targetDispatch( reducerKey );
		},
		select( reducerKey ) {
			if ( storeHotSwapPlugin.targetSelect === null || reducerKey !== 'core/block-editor' ) {
				return registry.select( reducerKey );
			}

			return storeHotSwapPlugin.targetSelect( reducerKey );
		},
	};
}

storeHotSwapPlugin.targetSelect = null;
storeHotSwapPlugin.targetDispatch = null;

storeHotSwapPlugin.setEditor = function ( select, dispatch ) {
	this.targetSelect = select;
	this.targetDispatch = dispatch;
};

storeHotSwapPlugin.resetEditor = function () {
	this.targetSelect = null;
	this.targetDispatch = null;
};

export default storeHotSwapPlugin;
