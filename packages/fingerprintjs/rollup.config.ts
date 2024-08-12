import typescript from '@rollup/plugin-typescript';

export default {
	input: 'src/index.ts',
	output: [
		{
			dir: 'dist/cjs',
			format: 'cjs',
			sourcemap: true,
		},
		{
			dir: 'dist/esm',
			format: 'esm',
			sourcemap: true,
		},
	],
	plugins: [
		typescript( {
			tsconfig: './tsconfig.rollupConfig.json',
		} ),
	],
};
