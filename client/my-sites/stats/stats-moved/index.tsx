import { __experimentalText as Text, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { Callout } from 'calypso/dashboard/components/callout';
import { STATS_PRODUCT_NAME, STATS_PRODUCT_NAME_IMPR } from 'calypso/my-sites/stats/constants';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import imageAr from './images/menu-ar.png';
import imageDe from './images/menu-de.png';
import imageEn from './images/menu-en.png';
import imageEs from './images/menu-es.png';
import imageFr from './images/menu-fr.png';
import imageHe from './images/menu-he.png';
import imageId from './images/menu-id.png';
import imageIt from './images/menu-it.png';
import imageJa from './images/menu-ja.png';
import imageKo from './images/menu-ko.png';
import imageNl from './images/menu-nl.png';
import imagePtBr from './images/menu-pt-br.png';
import imageRu from './images/menu-ru.png';
import imageSv from './images/menu-sv.png';
import imageTr from './images/menu-tr.png';
import imageZhCn from './images/menu-zh-cn.png';
import imageZhTw from './images/menu-zh-tw.png';

import './style.scss';

const images: Record< string, string > = {
	ar: imageAr,
	de: imageDe,
	en: imageEn,
	es: imageEs,
	fr: imageFr,
	he: imageHe,
	id: imageId,
	it: imageIt,
	ja: imageJa,
	ko: imageKo,
	nl: imageNl,
	'pt-br': imagePtBr,
	ru: imageRu,
	sv: imageSv,
	tr: imageTr,
	'zh-cn': imageZhCn,
	'zh-tw': imageZhTw,
};

const StatsMoved = () => {
	const siteId = useSelector( getSelectedSiteId );
	const wpAdminUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'admin.php?page=stats' )
	);

	const userLocale = useSelector( getCurrentUserLocale );
	const image = images[ userLocale ] ?? images.en;

	return (
		<Main className="stats-moved" ariaLabel={ STATS_PRODUCT_NAME }>
			<DocumentHead title={ STATS_PRODUCT_NAME } />
			<NavigationHeader title={ STATS_PRODUCT_NAME_IMPR } />
			<Callout
				icon={ chartBar }
				title={ __( 'Stats have moved' ) }
				description={
					<Text variant="muted">{ __( 'They can now be found at Jetpack → Stats.' ) }</Text>
				}
				image={ image }
				actions={
					wpAdminUrl && (
						<Button variant="primary" size="compact" href={ wpAdminUrl }>
							{ __( 'Check new Stats' ) }
						</Button>
					)
				}
			/>
		</Main>
	);
};

export default StatsMoved;
