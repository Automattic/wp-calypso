/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import { localize } from 'i18n-calypso';

const Navigation = ( { translate, theme, siteSlug, id, isLoaded, currentSection } ) => {
	const filterStrings = {
		'': translate( 'Overview', { context: 'Filter label for theme content' } ),
		setup: translate( 'Setup', { context: 'Filter label for theme content' } ),
		support: translate( 'Support', { context: 'Filter label for theme content' } ),
	};

	const sitePart = siteSlug ? `/${ siteSlug }` : '';
	const validSections = [];
	validSections.push( '' ); // Default section
	theme && theme.supportDocumentation && validSections.push( 'setup' );
	validSections.push( 'support' );

	let section = currentSection;
	if ( validSections.indexOf( currentSection ) === -1 ) {
		section = validSections[ 0 ];
	}

	const nav = (
		<NavTabs label="Details" >
			{ validSections.map( ( sec ) => (
				<NavItem key={ sec }
					path={ `/theme/${ id }${ sec ? '/' + sec : '' }${ sitePart }` }
					selected={ sec === section }>
					{ filterStrings[ sec ] }
				</NavItem>
			) ) }
		</NavTabs>
	);

	return (
		<SectionNav className="theme__sheet-section-nav" selectedText={ filterStrings[ section ] }>
			{ isLoaded && nav }
		</SectionNav>
	);
};

export default localize( Navigation );
