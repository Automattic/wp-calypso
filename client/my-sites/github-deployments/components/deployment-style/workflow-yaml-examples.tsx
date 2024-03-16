/* eslint-disable inclusive-language/use-inclusive-words */

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
