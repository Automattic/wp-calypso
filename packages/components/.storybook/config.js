import { configure } from '@storybook/react';
import '@automattic/calypso-color-schemes';

configure( require.context( '../src', true, /\.stories\.(j|t)sx?$/ ), module );
