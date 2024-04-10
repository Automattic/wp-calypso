import { SiteExcerptData } from '@automattic/sites';

type Props = {
	site: SiteExcerptData;
};

export default function SitePlanColumn( { site }: Props ) {
	return <span className="sites-overview__row-status">{ site.plan?.product_name_short }</span>;
}
