#!/bin/bash

sed -i -e "/^\\s\\* Version:/c\\ * Version: $BUILD_NUMBER" -e "/^define( 'A8C_ETK_PLUGIN_VERSION'/c\\define( 'A8C_ETK_PLUGIN_VERSION', '$BUILD_NUMBER' );" ./full-site-editing-plugin.php
sed -i -e "/^Stable tag:\\s/c\\Stable tag: $BUILD_NUMBER" ./readme.txt