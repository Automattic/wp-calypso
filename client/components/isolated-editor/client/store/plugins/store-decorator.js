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
function storeDecoratorPlugin( registry, pluginOptions ) {
	// Switch select and dispatch
	return {
		select( reducerKey ) {
			if ( pluginOptions && pluginOptions[ reducerKey ] ) {
				const original = registry.select( reducerKey );

				return {
					...original,
					...pluginOptions[ reducerKey ]( original, registry ),
				};
			}

			return registry.select( reducerKey );
		},
	};
}

export default storeDecoratorPlugin;
