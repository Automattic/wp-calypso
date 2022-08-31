/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import '@wordpress/block-library/build-style/style.css';
import '@wordpress/block-library/build-style/editor.css';
import '@wordpress/block-library/build-style/theme.css';
import '@wordpress/components/build-style/style.css';
import '@wordpress/block-editor/build-style/style.css';
import {
	store as blockEditorStore,
	BlockPreview as BlockEditorBlockPreview,
} from '@wordpress/block-editor';
import { registerCoreBlocks } from '@wordpress/block-library';
import { store as blocksStore } from '@wordpress/blocks';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect, useDispatch } from '@wordpress/data';
import { GlobalStylesProvider } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import ScreenStyleVariations from '@wordpress/edit-site/build-module/components/global-styles/screen-style-variations';
import { useEffect, useState } from 'react';
import useInitializeBlockSettings from '../hooks/use-initialize-block-settings';
import useWpcomApiFetch from '../hooks/use-wpcom-api-fetch';
import GlobalStylesRenderer from './global-styles-renderer';
import './styles.scss';

export interface Props {
	siteId: number;
}

const BlockPreview: React.FC< Props > = ( { siteId } ) => {
	const { patterns } = useSelect( ( select ) => {
		const { __experimentalGetAllowedPatterns } = select( blockEditorStore );
		const { __experimentalGetCurrentThemeGlobalStylesVariations } = select( coreStore );
		return {
			patterns: __experimentalGetAllowedPatterns(),
			// Preload style variations to avoid `ScreenStyleVariations` throwing error
			variations: __experimentalGetCurrentThemeGlobalStylesVariations(),
		};
	}, [] );

	const { __experimentalReapplyBlockTypeFilters } = useDispatch( blocksStore );

	const [ selectedPatterns, setSelectedPatterns ] = useState( [] );

	const onPatternSelect = ( pattern ) =>
		setSelectedPatterns( ( current ) => {
			const position = current.findIndex( ( p ) => p.name === pattern.name );
			if ( position >= 0 ) {
				return [ ...current.slice( 0, position ), ...current.slice( position + 1 ) ];
			}

			return [ ...current, pattern ];
		} );

	useWpcomApiFetch( siteId );

	useEffect( () => {
		__experimentalReapplyBlockTypeFilters();
		registerCoreBlocks();
	}, [] );

	useInitializeBlockSettings( siteId );

	if ( ! patterns.length ) {
		return null;
	}

	return (
		<GlobalStylesProvider>
			<GlobalStylesRenderer />
			<div className="block-preview__container">
				<div className="block-preview__sidebar">
					<div className="block-preview__style-variations-container">
						<div>Select Styles</div>
						<ScreenStyleVariations />
					</div>
					<div className="block-preview__patterns">
						<div>Select Patterns</div>
						{ patterns.slice( 0, 10 ).map( ( pattern ) => (
							<div
								key={ pattern.name }
								className="block-preview__pattern"
								onClick={ () => onPatternSelect( pattern ) }
							>
								<BlockEditorBlockPreview
									blocks={ pattern.blocks }
									viewportWidth={ pattern.viewportWidth }
								/>
								<div>{ pattern.title }</div>
							</div>
						) ) }
					</div>
				</div>
				<div className="block-preview__content">
					{ selectedPatterns.map( ( pattern, i ) => (
						<BlockEditorBlockPreview key={ i } blocks={ pattern.blocks } />
					) ) }
					{ selectedPatterns.length === 0 && (
						<p>Your page is blank. Start adding content on the left</p>
					) }
				</div>
			</div>
		</GlobalStylesProvider>
	);
};

export default BlockPreview;
