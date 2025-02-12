import { __ } from '@wordpress/i18n';
import React from 'react';

export default function Newsletter() {
	return (
		<div className="flex items-center justify-center h-screen bg-gray-100">
			<h1 className="text-4xl font-bold text-gray-800">
				{ __( 'This is the placeholder for the newsletter widget', 'newsletter-widget' ) }
			</h1>
		</div>
	);
}
