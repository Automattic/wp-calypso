import { Button } from '@automattic/components';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import SiteFavicon from '../site-favicon';
import { Site } from '../types';

interface SiteDataFieldProps {
	isLoading: boolean;
	site: Site;
	onSiteTitleClick: ( site: Site ) => void;
}

const SiteDataField = ( { isLoading, site, onSiteTitleClick }: SiteDataFieldProps ) => {
	if ( isLoading ) {
		return <TextPlaceholder />;
	}

	return (
		<Button className="sites-dataviews__site" onClick={ () => onSiteTitleClick( site ) } borderless>
			<SiteFavicon site={ site } />
			<div className="sites-dataviews__site-name">
				{ site.blogname }
				<div className="sites-dataviews__site-url">{ site.url }</div>
			</div>
		</Button>
	);
};

export default SiteDataField;
