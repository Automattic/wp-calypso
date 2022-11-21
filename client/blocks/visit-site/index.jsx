import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import wpcom from 'calypso/lib/wp';

import './style.scss';

function useSite( siteSlug ) {
	const [ site, setSite ] = useState( null );

	useEffect( () => {
		wpcom.site( siteSlug ).get( { apiVersion: '1.2' } ).then( setSite );
	}, [ siteSlug ] );

	return site;
}

export default function VisitSite( { linkWithSiteName = true, siteSlug } ) {
	const translate = useTranslate();
	const site = useSite( siteSlug );

	if ( ! site ) {
		return null;
	}

	const siteLink = <a href={ site.URL }>{ linkWithSiteName ? site.name.trim() : siteSlug }</a>;

	return (
		<div className="visit-site">
			{ translate( 'or visit {{siteLink/}}', {
				components: { siteLink },
				context: 'Alternative link under login/site-selection header, leads to site frontend.',
			} ) }
		</div>
	);
}
