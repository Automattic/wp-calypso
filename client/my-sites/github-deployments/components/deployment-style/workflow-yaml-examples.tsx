/* eslint-disable inclusive-language/use-inclusive-words */

export const newWorkflowExample = ( branch: string ) => {
	return `
name: Publish Website

on:
  push:
    branches:
      - ${ branch }
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
        path: |
          .
          !.DS_Store 
          !.stylelintrc.json 
          !.eslintrc 
          !.git 
          !.gitattributes 
          !.github 
          !.gitignore 
          !README.md 
          !composer.json 
          !composer.lock 
          !node_modules 
          !vendor
          !package-lock.json 
          !package.json 
          !.travis.yml 
          !phpcs.xml.dist 
          !sass 
          !style.css.map 
          !yarn.lock
`.trim();
};

export const newComposerWorkflowExample = ( branch: string ) => {
	return `
name: Publish Website

on:
  push:
    branches:
      - ${ branch }
  workflow_dispatch:
jobs:
  Build-Artifact-Action:
    name: Build-Artifact-Action
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master
    - name: Install PHP dependencies
      uses: php-actions/composer@v6
      with:
        dev: no
        php_version: 8.2
    - name: Upload the artifact
      uses: actions/upload-artifact@v4
      with:
        name: wpcom
        path: |
          .
          !.DS_Store 
          !.stylelintrc.json 
          !.eslintrc 
          !.git 
          !.gitattributes 
          !.github 
          !.gitignore 
          !README.md 
          !composer.json 
          !composer.lock 
          !node_modules 
          !vendor
          !package-lock.json 
          !package.json 
          !.travis.yml 
          !phpcs.xml.dist 
          !sass 
          !style.css.map 
          !yarn.lock
`.trim();
};

export const CodePushExample = ( branch: string ) => {
	return `
on:
  push:
    branches:
      - ${ branch }
  workflow_dispatch:
`.trim();
};

export const UploadArtifactExample = () => {
	// It's important to keep the indentation the same way we expect to see it in the final file
	return `
- name: Upload the artifact
  uses: actions/upload-artifact@v4
	with:
		name: wpcom
		path: |
			.
			!.DS_Store 
			!.stylelintrc.json 
			!.eslintrc 
			!.git 
			!.gitattributes 
			!.github 
			!.gitignore 
			!README.md 
			!composer.json 
			!composer.lock 
			!node_modules 
			!vendor
			!package-lock.json 
			!package.json 
			!.travis.yml 
			!phpcs.xml.dist 
			!sass 
			!style.css.map 
			!yarn.lock
`.trim();
};
