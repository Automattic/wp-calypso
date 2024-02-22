export const NewWorkflowExample = ( default_branch: string ) => {
	return `
name: Publish Website

on:
  push:
    branches:
      - ${
				default_branch
				// eslint-disable-next-line inclusive-language/use-inclusive-words
			}
  workflow_dispatch:
jobs:
  Build-Artifact-Action:
    name: Build-Artifact-Action
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master

    - name: Upload the artifact
        uses: actions/upload-artifact@v4
        with:
            name: wpcom
            path: .

`;
};

export const CodePushExample = ( default_branch: string ) => {
	return `
on:
  push:
    branches:
      - ${ default_branch }

`;
};

export const UploadArtifactExample = () => {
	// It's important to keep the indentation the same way we expect to see it in the final file
	return `

    - name: Upload the artifact
        uses: actions/upload-artifact@v4
        with:
            name: wpcom
            path: .

`;
};
