import { defineConfig, devices } from '@playwright/test';

export default defineConfig( {
	testDir: '.',
	fullyParallel: false,
	forbidOnly: false,
	retries: 0,
	workers: 1,
	timeout: 300000, // 5 minutes for manual login
	use: {
		trace: 'off',
		screenshot: 'off',
		video: 'off',
		channel: 'chrome', // Use system Chrome, no Chromium install needed
	},
	projects: [
		{
			name: 'default',
			use: {
				...devices[ 'Desktop Chrome HiDPI' ],
			},
		},
	],
} );
