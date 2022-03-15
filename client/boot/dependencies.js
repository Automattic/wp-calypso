/* eslint-disable wpcalypso/no-unsafe-wp-apis */
import {
	__experimentalNavigation,
	__experimentalNavigationMenu,
	__experimentalNavigationGroup,
	__experimentalNavigationItem,
} from '@wordpress/components';
import { createContext, createElement, useContext, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
/* eslint-enable wpcalypso/no-unsafe-wp-apis */

if ( ! window.wp ) {
	window.wp = {};
}

window.wp.components = {
	__experimentalNavigation,
	__experimentalNavigationMenu,
	__experimentalNavigationGroup,
	__experimentalNavigationItem,
};

window.wp.element = {
	createContext,
	createElement,
	useContext,
	useState,
};

window.wp.i18n = {
	__,
};
