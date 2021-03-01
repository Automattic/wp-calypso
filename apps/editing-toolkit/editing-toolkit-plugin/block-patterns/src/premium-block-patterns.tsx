/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { registerPlugin as originalRegisterPlugin, PluginSettings } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import './style.scss';

interface PatternTitleProps {
	title: string;
	description?: string;
}

interface ExperimentalBlockPattern {
	categories: string[];
	content: string;
	description: string;
	isPremium: boolean;
	name: string;
	title: string;
	viewportWidth: number;
}

export const PatternTitleContainer: React.FunctionComponent< PatternTitleProps > = ( {
	title,
} ) => {
	return (
		<div>
			<div className="pattern-title-container"></div>
			<span className="premium-pattern-title"> { title } </span>
		</div>
	);
};

export const PremiumBlockPatterns: React.FunctionComponent = () => {
	const { __experimentalBlockPatterns } = useSelect( ( select ) =>
		select( 'core/block-editor' ).getSettings()
	);
	const { updateSettings } = useDispatch( 'core/block-editor' );

	if ( __experimentalBlockPatterns ) {
		let shouldUpdateBlockPatterns = false;
		const updatedPatterns: Array = [];

		__experimentalBlockPatterns.forEach( ( originalPattern: ExperimentalBlockPattern ) => {
			const pattern = { ...originalPattern };

			if ( pattern.isPremium && typeof pattern.title === 'string' ) {
				const originalTitle = pattern.title;

				const titleOverride = <PatternTitleContainer title={ originalTitle } />;

				// When React is running in development mode, ReactElement calls Object.freeze() on the element.
				// To prevent the editor from throwing a fatal, we should only attempt to run the override
				// when the React element is extensible so we can use the custom toString method. This means that
				// in React development mode (define SCRIPT_DEBUG as true in PHP) this feature is switched off.
				// See: https://github.com/facebook/react/blob/702fad4b1b48ac8f626ed3f35e8f86f5ea728084/packages/react/src/jsx/ReactJSXElement.js#L194
				if ( Object.isExtensible( titleOverride ) ) {
					pattern.title = titleOverride;
					pattern.title.toString = () =>
						sprintf(
							// translators: %s is the title of a block pattern e.g. "Two columns (Premium)". "Premium" is synonymous with "paid"
							__( '%s (Premium)', 'full-site-editing' ),
							originalTitle
						);
					shouldUpdateBlockPatterns = true;
				}
			}
			updatedPatterns.push( pattern );
		} );

		if ( shouldUpdateBlockPatterns ) {
			updateSettings( {
				__experimentalBlockPatterns: updatedPatterns,
			} );
		}
	}

	return null;
};

const registerPlugin = ( name: string, settings: Omit< PluginSettings, 'icon' > ) =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	originalRegisterPlugin( name, settings as any );

registerPlugin( 'a8c-wpcom-premium-block-patterns', {
	render: () => {
		return <PremiumBlockPatterns />;
	},
} );
