import { useHasEnTranslation } from '@automattic/i18n-utils';
import { chartBar } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FeatureMoved from 'calypso/components/feature-moved';
import Main from 'calypso/components/main';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
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

const JetpackStats = () => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const userLocale = useSelector( getCurrentUserLocale );
	const image = images[ userLocale ] ?? images.en;
	const siteId = useSelector( getSelectedSiteId );
	const wpAdminUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'admin.php?page=stats' )
	);

	if ( ! wpAdminUrl ) {
		return null;
	}

	if (
		! hasEnTranslation( 'Stats have moved' ) ||
		! hasEnTranslation(
			'Stats are now part of Jetpack for enhanced features. Access them via Jetpack → Stats in your dashboard.'
		) ||
		! hasEnTranslation( 'Go to Jetpack Stats' )
	) {
		window.location.replace( wpAdminUrl );
		return null;
	}

	return (
		<Main>
			<DocumentHead title={ STATS_PRODUCT_NAME } />
			<FeatureMoved
				icon={ chartBar }
				title={ translate( 'Stats have moved' ) }
				description={ translate(
					'Stats are now part of Jetpack for enhanced features. Access them via Jetpack → Stats in your dashboard.'
				) }
				buttonText={ translate( 'Go to Jetpack Stats' ) }
				buttonLink={ wpAdminUrl }
				image={ image }
			/>
		</Main>
	);
};

export default JetpackStats;
