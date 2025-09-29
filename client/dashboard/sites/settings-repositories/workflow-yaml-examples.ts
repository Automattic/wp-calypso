export const codePushExample = ( branch: string ) => {
	return `
on:
  push:
    branches:
      - ${ branch }
  workflow_dispatch:
`.trim();
};

export const uploadArtifactExample = () => {
	// It's important to keep the indentation the same way we expect to see it in the final file
	return `
- name: Upload the artifact
  uses: actions/upload-artifact@v4
	with:
		name: wpcom
		path: |
			.
			!.git
`.trim();
};

export const DEFAULT_WORKFLOW_TEMPLATE = `name: Deploy to WordPress.com
on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Upload the artifact
        uses: actions/upload-artifact@v4
        with:
          name: wpcom
          path: |
            .
            !.git`;
