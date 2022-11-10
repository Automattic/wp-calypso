import '@wordpress/block-library/build-style/style.css';
import '@wordpress/block-library/build-style/editor.css';
import '@wordpress/block-library/build-style/theme.css';
import '@wordpress/components/build-style/style.css';
import '@wordpress/block-editor/build-style/style.css';
import { registerCoreBlocks } from '@wordpress/block-library';
import { GlobalStylesRenderer } from '@wordpress/edit-site/build-module/components/editor/global-styles-renderer';
import { GlobalStylesProvider } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import React, { useEffect } from 'react';
import useInitializeBlockSettings from '../hooks/use-initialize-block-settings';
import useWpcomApiFetch from '../hooks/use-wpcom-api-fetch';

export interface Props {
	siteId: number;
	children: JSX.Element;
}

let blocksRegistered = false;

const BlocksRendererProvider: React.FC< Props > = ( { siteId, children } ) => {
	useWpcomApiFetch( siteId );

	useInitializeBlockSettings( siteId );

	useEffect( () => {
		if ( blocksRegistered ) {
			return;
		}

		// Fix the coreBlocks contain null element until we're able to upgrade `@wordpress/block-library` to 7.14.0 or above
		const originalFilter = Array.prototype.filter;
		Array.prototype.filter = function ( predicateFunction ) {
			const results = [];
			this.forEach( ( item, index, array ) => {
				try {
					if ( predicateFunction( item, index, array ) ) {
						results.push( item );
					}
				} catch {}
			} );
			return results;
		};

		registerCoreBlocks();
		blocksRegistered = true;

		Array.prototype.filter = originalFilter;
	}, [] );

	return (
		<GlobalStylesProvider>
			<GlobalStylesRenderer />
			{ children }
		</GlobalStylesProvider>
	);
};

export default BlocksRendererProvider;
