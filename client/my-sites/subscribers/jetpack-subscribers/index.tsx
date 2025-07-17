import page from '@automattic/calypso-router';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { people } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FeatureMoved from 'calypso/components/feature-moved';
import Main from 'calypso/components/main';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
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

const JetpackSubscribers = () => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const userLocale = useSelector( getCurrentUserLocale );
	const image = images[ userLocale ] ?? images.en;

	if (
		! hasEnTranslation( 'Subscribers has moved' ) ||
		! hasEnTranslation(
			'Subscribers is now part of Jetpack for enhanced features. Access it via Jetpack → Subscribers in your dashboard.'
		) ||
		! hasEnTranslation( 'Go to Jetpack Subscribers' )
	) {
		page.redirect( `/subscribers/${ siteSlug }` );
		return null;
	}

	return (
		<Main>
			<DocumentHead title={ translate( 'Subscribers' ) } />
			<FeatureMoved
				icon={ people }
				title={ translate( 'Subscribers has moved' ) }
				description={ translate(
					'Subscribers is now part of Jetpack for enhanced features. Access it via Jetpack → Subscribers in your dashboard.'
				) }
				buttonText={ translate( 'Go to Jetpack Subscribers' ) }
				buttonLink={ `/subscribers/${ siteSlug }` }
				image={ image }
			/>
		</Main>
	);
};

export default JetpackSubscribers;
