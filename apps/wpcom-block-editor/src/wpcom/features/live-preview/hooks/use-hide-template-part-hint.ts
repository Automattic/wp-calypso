import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';

/**
 * Suppress the "Looking for template parts?" notice in the Site Editor sidebar.
 */
export const useHideTemplatePartHint = () => {
	const { set: setPreferences } = useDispatch( 'core/preferences' );
	useEffect( () => {
		// The preference name is defined in https://github.com/WordPress/gutenberg/blob/d47419499cd58e20db25c370cdbf02ddf7cffce0/packages/edit-site/src/components/sidebar-navigation-screen-main/template-part-hint.js#L9.
		setPreferences( 'core', 'isTemplatePartMoveHintVisible', false );
	}, [ setPreferences ] );
};
