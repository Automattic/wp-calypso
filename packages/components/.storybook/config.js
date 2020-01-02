import { configure } from '@storybook/react';
import '@automattic/calypso-color-schemes/dist/calypso-color-schemes.css';

configure( require.context( '../src', true, /\.stories\.(j|t)sx?$/ ), module );
