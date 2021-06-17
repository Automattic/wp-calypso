/**
 * External Dependencies
 */
import React from 'react';
import { useI18n } from '@wordpress/react-i18n';

/**
 * Style dependencies
 */
import './style.scss';

const ScreenSwitcher = () => {
	const { __ } = useI18n();

	return (
		<div className="screen-switcher">
			<button className="screen-switcher__button">
				<strong>{ __( 'Default view' ) }</strong>
				<p>{ __( 'Our WordPress.com redesign for a better experience.' ) }</p>
			</button>
			<button className="screen-switcher__button">
				<strong>{ __( 'Classic view' ) }</strong>
				<p>{ __( 'The classic WP-Admin WordPress interface.' ) }</p>
			</button>
		</div>
	);
};

export default ScreenSwitcher;
