import { defineConfig } from 'eslint/config';
import calypso, { nodeConfig } from './index.mjs';

export default defineConfig( [ ...calypso( import.meta.dirname ), nodeConfig ] );
