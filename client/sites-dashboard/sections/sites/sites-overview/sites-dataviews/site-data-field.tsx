import { Button } from '@automattic/components';
import { SiteExcerptData } from '@automattic/sites';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import SiteFavicon from '../site-favicon';

interface SiteDataFieldProps {
	isLoading: boolean;
	site: SiteExcerptData;
	onSiteTitleClick: ( site: SiteExcerptData ) => void;
}

const SiteDataField = ( { isLoading, site, onSiteTitleClick }: SiteDataFieldProps ) => {
	if ( isLoading ) {
		return <TextPlaceholder />;
	}

	return (
		<Button className="sites-dataviews__site" onClick={ () => onSiteTitleClick( site ) } borderless>
			<SiteFavicon site={ site } />
			<div className="sites-dataviews__site-name">
				{ site.name || site.slug }
				<div className="sites-dataviews__site-url">{ site.name }</div>
			</div>
		</Button>
	);
};

export default SiteDataField;
