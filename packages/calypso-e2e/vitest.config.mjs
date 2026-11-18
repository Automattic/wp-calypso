import { mergeConfig } from 'vitest/config';
import shared from '../../test/packages/vitest.config.mjs';

// Tests also sit deeper than a `test` folder's top level, so match them by name too.
export default mergeConfig( shared, { test: { include: [ 'src/**/*.test.ts' ] } } );
