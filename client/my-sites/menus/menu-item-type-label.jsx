/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

const MenuItemTypeLabel = ( { name, label, translate } ) => {
	const labels = {
		page: translate( 'Page' ),
		custom: translate( 'Link' ),
		category: translate( 'Category' ),
		post_tag: translate( 'Tag' ),
		post_format: translate( 'Post Format' ),
		post: translate( 'Post' ),
	};
	const typeLabel = name in labels ? labels[ name ] : label;

	return <span>{ typeLabel }</span>;
};

export default localize( MenuItemTypeLabel );

