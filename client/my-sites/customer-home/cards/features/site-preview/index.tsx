import { useSelector } from 'calypso/state';
import { getWpComDomainBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';

const SitePreview = (): JSX.Element => {
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = selectedSite?.ID;
	// const domains = [ selectedSiteId ];
	const domains = useSelector( ( state ) => getWpComDomainBySiteId( state, selectedSiteId ) );
	const wpComDomain = domains?.domain;

	const iframeSrcKeepHomepage = wpComDomain
		? `//${ wpComDomain }/?hide_banners=true&preview_overlay=true`
		: undefined;
	return (
		<div className="home-site-preview">
			{ wpComDomain && (
				<div className="home-site-preview__iframe-wrapper">
					<iframe scrolling="no" loading="lazy" title="title" src={ iframeSrcKeepHomepage } />
				</div>
			) }
		</div>
	);
};

export default SitePreview;
