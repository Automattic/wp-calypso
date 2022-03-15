// Initialize polyfills before any dependencies are loaded
import './polyfills';
import './dependencies';

import { bootApp } from './common';

import 'calypso/assets/stylesheets/style.scss';

window.AppBoot = () => {
	bootApp( 'Calypso' );
};
