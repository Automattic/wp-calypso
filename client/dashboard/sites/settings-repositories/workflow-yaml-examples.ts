export const codePushExample = ( branch: string ) => `on:
  push:
    branches:
      - ${ branch }
  workflow_dispatch:
`;

export const uploadArtifactExample = () => `- name: Upload the artifact
  uses: actions/upload-artifact@v4
  with:
    name: wpcom
    path: |
      .
      !.git`;

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
