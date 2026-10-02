module.exports = {
	displayName: 'agent-components-mcp',
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	testMatch: [ '<rootDir>/src/__tests__/*.[jt]s?(x)' ],
	moduleNameMapper: {
		'^@automattic/agent-components$': '<rootDir>/../../packages/agent-components/src/index.ts',
	},
};
