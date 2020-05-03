/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import wpcom from 'lib/wp';

/**
 * Style dependencies
 */
import './style.scss';

function useSite( siteSlug ) {
	const [ site, setSite ] = useState( null );

	useEffect( () => {
		wpcom.site( siteSlug ).get( { apiVersion: '1.2' } ).then( setSite );
	}, [ siteSlug ] );

	return site;
}

export default function VisitSite( { siteSlug } ) {
	const translate = useTranslate();
	const site = useSite( siteSlug );

	if ( ! site ) {
		return null;
	}

	const siteLink = <a href={ site.URL }>{ site.name.trim() }</a>;

	return (
		<div className="visit-site">
			{ translate( 'or visit {{siteLink/}}', {
				components: { siteLink },
				context: 'Alternative link under login/site-selection header, leads to site frontend.',
			} ) }
		</div>
	);
}
