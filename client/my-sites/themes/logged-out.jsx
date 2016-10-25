/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ThemeShowcase from './theme-showcase';
import {
	preview,
	signup,
	separator,
	info,
	support,
	help,
	bindOptions
} from './theme-options';

const BoundThemeShowcase = connect( ...bindOptions )( ThemeShowcase );

export default props => (
	<BoundThemeShowcase { ...props }
	options={ {
		signup,
		preview,
		separator,
		info,
		support,
		help
	} }
	defaultOption="signup"
	getScreenshotOption={ function() {
		return 'info';
	} }
	source="showcase" />
);
