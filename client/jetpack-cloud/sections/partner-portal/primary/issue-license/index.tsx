/**
 * External dependencies
 */
import React, { ReactElement, useEffect } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import IssueLicenseForm from 'calypso/jetpack-cloud/sections/partner-portal/issue-license-form';

export default function IssueLicense(): ReactElement {
	const translate = useTranslate();

	useEffect( () => {
		const layoutClass = 'layout__content--partner-portal-issue-license';
		const content = document.getElementById( 'content' );

		if ( content ) {
			content.classList.add( layoutClass );

			return () => content.classList.remove( layoutClass );
		}
	}, [] );

	return (
		<Main className="issue-license">
			<SidebarNavigation sectionTitle={ translate( 'Issue a new License' ) } />
			<CardHeading size={ 36 }>{ translate( 'Issue a new License' ) }</CardHeading>

			<IssueLicenseForm />
		</Main>
	);
}
