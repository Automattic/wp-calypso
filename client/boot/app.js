// Initialize polyfills before any dependencies are loaded
import './polyfills';

import { bootApp } from './common';

import 'calypso/assets/stylesheets/style.scss';

bootApp( 'Calypso' );
