import { createContext } from '@wordpress/element';
import type { BlockRendererSettings } from '../types';

export interface BlockRendererContextValue {
	isReady: boolean;
	settings: BlockRendererSettings;
}

const BlockRendererContext = createContext< BlockRendererContextValue >( {
	isReady: true,
	settings: {},
} );

export default BlockRendererContext;
