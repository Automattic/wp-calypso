import clsx from 'clsx';
import React from 'react';
import Breadcrumb from 'calypso/components/breadcrumb';
import FormattedHeader from 'calypso/components/formatted-header';
import { preventWidows } from 'calypso/lib/formatting';
import CollectionBackButton from 'calypso/my-sites/themes/collections/collection-back-button';
import { THEME_COLLECTIONS } from 'calypso/my-sites/themes/collections/collection-definitions';
import './theme-collection-view-header.scss';

export default function ThemeCollectionViewHeader( { backUrl, filter, tier, isLoggedIn } ) {
	const keyParts = [ tier, filter ];
	const key = keyParts.filter( ( part ) => !! part ).join( '-' ) || 'recommended';
	const { title, description } = THEME_COLLECTIONS[ key ];

	const classnames = clsx( 'theme-collection-view-header', {
		'is-logged-in': isLoggedIn,
	} );

	const navigationItems = [
		{ label: 'Themes', href: backUrl },
		{ label: title, href: '' },
	];

	return (
		<div className={ classnames }>
			{ isLoggedIn ? (
				<Breadcrumb items={ navigationItems } hideWhenOnlyOneLevel />
			) : (
				<CollectionBackButton backUrl={ backUrl } />
			) }
			<FormattedHeader
				align="left"
				headerText={ title }
				subHeaderText={ preventWidows( description ) }
			/>
		</div>
	);
}
