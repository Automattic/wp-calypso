# Commands executed with yarn start

<!--

In order to update the diagram:

- Navigate to the below link `Link to the online version here`
- Edit the diagram in the `Code` tab
- At the bottom, expand the `Actions` section
- Click on `Copy Markdown`
- Paste the result below
- Update the `Link to the online version here` with the URL of the online diagram

- Alternatively, the diagram can be exported as a PNG file by clicking on `Download PNG` in the `Actions` section, use it as an image, and only update the `yarn-start.md` file
-->

This is a graphical representation of the commands being executed when you run `yarn start`:

## Diagram

[![](https://mermaid.ink/img/pako:eNptVE1z0zAQ_Sse9VCHieP4o47jA0wLzNBCgRk4UfcgS3IsqkgaS25qOvnvrK2kJKHWxbP73u5b7a6eEVGUoQKtWqwb7-eVB18pje0F8zaaeDUXojirl_XU2FY9sOIsSZLdf7Dh1DZFqp9KOZxLv8et9IzFrZ0EwdsrnzSMPHgSUniPrDVcyYlLcAnu9_7o2DBB1JrNfpsDX99WLljbSa_quKBHTnPgHdMFhxgguxDmJMaAtZycwog5BQZgOkJ98sEXaC8w3rlDUPZIFTHFm_Mj4PU_oMMZ1kLp-7CCM2kDXge6VQdyDTBvfKmfPEn0TqWnu0qA2BfAZ9_bI1ycUPAqHOJzAr1Q7QPkOSRBEUD78p90sA-yS3kNbrikQ6F7K-Haf1VzKUcxMBt3dxtWaQwNDgKiZM1Xe107-8xZZ0Obob339ztuZYg-vXCXvSBK98Fa0U4wM6YiOgiujfcdUr8D6q2bmYrLcIQOkjpiYbD2rGGOgAj6j4hfj6p5DfFthxBYrjq8YmYomUlcCUbH-zRDf0GS7_slcjIGQuikQ94STSYTtwruoClas3aNOYUNey4ldBvZhq1ZiQr4pazGnbAlKuUWoJ2m2LKPlFvVoqLGwrApwp1VP3pJUGHbju1BHziGhV2_oITClAHpGdlej-vMjYWQrgGDvWsFmBtrtSnCcHDPVtw2XQVNWoeG0wa2qHlcZmEWZzmOE5YtEnyRJJRU0TKv4zSq6WIexRhtt1OksRyiPqEiXs7iOJpneZwv4GlIoinqUREtZvFyvkwv0jzP54tlnAPpj1IgOZrN02yeRuDJ0kWaAYGNNd-6l2h8kMYMv0b8WOL2L2LbjD4?type=png)](https://mermaid.live/edit#pako:eNptVE1z0zAQ_Sse9VCHieP4o47jA0wLzNBCgRk4UfcgS3IsqkgaS25qOvnvrK2kJKHWxbP73u5b7a6eEVGUoQKtWqwb7-eVB18pje0F8zaaeDUXojirl_XU2FY9sOIsSZLdf7Dh1DZFqp9KOZxLv8et9IzFrZ0EwdsrnzSMPHgSUniPrDVcyYlLcAnu9_7o2DBB1JrNfpsDX99WLljbSa_quKBHTnPgHdMFhxgguxDmJMaAtZycwog5BQZgOkJ98sEXaC8w3rlDUPZIFTHFm_Mj4PU_oMMZ1kLp-7CCM2kDXge6VQdyDTBvfKmfPEn0TqWnu0qA2BfAZ9_bI1ycUPAqHOJzAr1Q7QPkOSRBEUD78p90sA-yS3kNbrikQ6F7K-Haf1VzKUcxMBt3dxtWaQwNDgKiZM1Xe107-8xZZ0Obob339ztuZYg-vXCXvSBK98Fa0U4wM6YiOgiujfcdUr8D6q2bmYrLcIQOkjpiYbD2rGGOgAj6j4hfj6p5DfFthxBYrjq8YmYomUlcCUbH-zRDf0GS7_slcjIGQuikQ94STSYTtwruoClas3aNOYUNey4ldBvZhq1ZiQr4pazGnbAlKuUWoJ2m2LKPlFvVoqLGwrApwp1VP3pJUGHbju1BHziGhV2_oITClAHpGdlej-vMjYWQrgGDvWsFmBtrtSnCcHDPVtw2XQVNWoeG0wa2qHlcZmEWZzmOE5YtEnyRJJRU0TKv4zSq6WIexRhtt1OksRyiPqEiXs7iOJpneZwv4GlIoinqUREtZvFyvkwv0jzP54tlnAPpj1IgOZrN02yeRuDJ0kWaAYGNNd-6l2h8kMYMv0b8WOL2L2LbjD4)

## Mermaid Diagram

```mermaid
graph TB
style wpc fill:#f9f,stroke:#333,stroke-width:4px


A(yarn start)-->B(check node version)
A-->C(node welcome.js)
A-->yrb(yarn run build)
A-->yrsb(yarn run start-build)
yrb-->yrbs(yarn run build static)
yrb-->yrbcss(yarn run build-css)
yrb-->H(run-p -s 'build-devdocs:*')
yrb-->I(run-p -s build-server build-client-if-prod)
yrbs-->J(npx ncp static public)
yrbs-->K( npx ncp client/lib/service-worker public)
yrbcss-->L(run-p -s 'build-css:*')
I-->bs(build-server)
I-->bcip(build-client-if-prod)
bs-->wpc[[webpack --config client/webpack.config.node.js]]
bs-->bscp(yarn run build-server:copy-modules)
bscp--Is Prod?-->M(node bin/copy-production-modules.js)
bcip--Is Prod?-->N(build-client)
bcip--Is Prod?-->O(build-languages-if-enabled)
yrsb-->nbs((("node build/server.js")))

```

[Link to the online version here](https://mermaid.live/edit#pako:eNptVE1z0zAQ_Sse9VCHieP4o47jA0wLzNBCgRk4UfcgS3IsqkgaS25qOvnvrK2kJKHWxbP73u5b7a6eEVGUoQKtWqwb7-eVB18pje0F8zaaeDUXojirl_XU2FY9sOIsSZLdf7Dh1DZFqp9KOZxLv8et9IzFrZ0EwdsrnzSMPHgSUniPrDVcyYlLcAnu9_7o2DBB1JrNfpsDX99WLljbSa_quKBHTnPgHdMFhxgguxDmJMaAtZycwog5BQZgOkJ98sEXaC8w3rlDUPZIFTHFm_Mj4PU_oMMZ1kLp-7CCM2kDXge6VQdyDTBvfKmfPEn0TqWnu0qA2BfAZ9_bI1ycUPAqHOJzAr1Q7QPkOSRBEUD78p90sA-yS3kNbrikQ6F7K-Haf1VzKUcxMBt3dxtWaQwNDgKiZM1Xe107-8xZZ0Obob339ztuZYg-vXCXvSBK98Fa0U4wM6YiOgiujfcdUr8D6q2bmYrLcIQOkjpiYbD2rGGOgAj6j4hfj6p5DfFthxBYrjq8YmYomUlcCUbH-zRDf0GS7_slcjIGQuikQ94STSYTtwruoClas3aNOYUNey4ldBvZhq1ZiQr4pazGnbAlKuUWoJ2m2LKPlFvVoqLGwrApwp1VP3pJUGHbju1BHziGhV2_oITClAHpGdlej-vMjYWQrgGDvWsFmBtrtSnCcHDPVtw2XQVNWoeG0wa2qHlcZmEWZzmOE5YtEnyRJJRU0TKv4zSq6WIexRhtt1OksRyiPqEiXs7iOJpneZwv4GlIoinqUREtZvFyvkwv0jzP54tlnAPpj1IgOZrN02yeRuDJ0kWaAYGNNd-6l2h8kMYMv0b8WOL2L2LbjD4)
