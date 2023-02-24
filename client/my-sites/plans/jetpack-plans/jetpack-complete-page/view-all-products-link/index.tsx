import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

type Props = {
	siteSlug?: string;
};

const ViewAllProductsLink: React.FC< Props > = ( { siteSlug } ) => {
	const translate = useTranslate();

	return (
		<a
			className="view-all-products-link"
			onClick={ () => recordTracksEvent( 'calypso_view_individual_products_link_click' ) }
			href={ `https://cloud.jetpack.com/pricing/${ siteSlug }` }
		>
			{ translate( 'View individual products' ) }
		</a>
	);
};

export default ViewAllProductsLink;
