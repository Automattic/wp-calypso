/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';

/**
 * WordPress dependencies
 */
import { withRegistry, createRegistry, RegistryProvider, plugins } from '@wordpress/data';
import { createHigherOrderComponent } from '@wordpress/compose';
import { storeConfig as blockEditorStoreConfig } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import storeConfig from '../../store';
import applyMiddlewares from '../../store/middlewares';
import applyBlockEditorMiddlewares from './middlewares';
import reusableStore from './reusable-store';
import applyDefaultSettings from '../default-settings';

// Keep track of the registries we create so we can release them after the editor instance is removed
let registries = [];

const STORE_NAME = 'isolated/editor';

/**
 * This is the core of having a multi-editor Gutenberg experience.
 *
 * We create a sub registry that contains copies of `core/block-editor`, `core/editor`, and STORE_NAME. These are specific to the editor instance and
 * provide the content for each editor, as well as overriding some core functions
 *
 * The key `persistenceKey` from the settings is used as the `localStorage` key to save Gutenberg preferences
 */
const withRegistryProvider = createHigherOrderComponent(
	( WrappedComponent ) =>
		withRegistry( ( props ) => {
			const { registry, settings, ...additionalProps } = props;
			const defaultSettings = applyDefaultSettings( settings );
			const { persistenceKey, preferencesKey, defaultPreferences } = defaultSettings.iso;
			const [ subRegistry, setSubRegistry ] = useState( null );

			useEffect( () => {
				// Create a new registry for this editor. We have the STORE_NAME for storing blocks and P2 data
				// and a duplicate of `core/block-editor` for storing block selections
				const newRegistry = createRegistry(
					{
						'core/reusable-blocks': reusableStore,
					},
					registry
				);

				// Enable the persistence plugin so we use settings in `localStorage`
				if ( persistenceKey ) {
					newRegistry.use( plugins.persistence, {
						persistenceKey,
					} );
				}

				// Create our custom store
				const store = newRegistry.registerStore(
					STORE_NAME,
					storeConfig( preferencesKey, defaultPreferences )
				);

				// Create the core/block-editor store separatley as we need the persistence plugin to be active
				const editorStore = newRegistry.registerStore( 'core/block-editor', {
					...blockEditorStoreConfig,
					persist: [ 'preferences' ],
				} );

				registries.push( store );
				registries.push( editorStore );

				// This should be removed after the refactoring of the effects to controls.
				applyMiddlewares( store );
				setSubRegistry( newRegistry );

				applyBlockEditorMiddlewares( editorStore );

				return function cleanup() {
					registries = registries.filter( ( item ) => item !== store && item !== editorStore );
				};
			}, [ registry ] );

			if ( ! subRegistry ) {
				return null;
			}

			return (
				<RegistryProvider value={ subRegistry }>
					<WrappedComponent { ...additionalProps } settings={ defaultSettings } />
				</RegistryProvider>
			);
		} ),
	'withRegistryProvider'
);

export default withRegistryProvider;
