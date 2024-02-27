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
		<div className="sites-dataviews__site">
			<Button onClick={ () => onSiteTitleClick( site ) } borderless>
				<SiteFavicon site={ site } />
			</Button>
			<div className="sites-dataviews__site-name">
				<Button onClick={ () => onSiteTitleClick( site ) } borderless>
					{ site.blogname }
				</Button>
				<Button href={ site.url_with_scheme } borderless target="_blank">
					<div className="sites-dataviews__site-url">{ site.url }</div>
				</Button>
			</div>
		</div>
	);
};

export default SiteDataField;
