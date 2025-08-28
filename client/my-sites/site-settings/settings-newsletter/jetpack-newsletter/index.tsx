import { useHasEnTranslation } from '@automattic/i18n-utils';
import { envelope } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FeatureMoved from 'calypso/components/feature-moved';
import Main from 'calypso/components/main';
import { navigate } from 'calypso/lib/navigate';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import imageArAtomic from './images/atomic/menu-ar.png';
import imageDeAtomic from './images/atomic/menu-de.png';
import imageEnAtomic from './images/atomic/menu-en.png';
import imageEsAtomic from './images/atomic/menu-es.png';
import imageFrAtomic from './images/atomic/menu-fr.png';
import imageHeAtomic from './images/atomic/menu-he.png';
import imageIdAtomic from './images/atomic/menu-id.png';
import imageItAtomic from './images/atomic/menu-it.png';
import imageJaAtomic from './images/atomic/menu-ja.png';
import imageKoAtomic from './images/atomic/menu-ko.png';
import imageNlAtomic from './images/atomic/menu-nl.png';
import imagePtBrAtomic from './images/atomic/menu-pt-br.png';
import imageRuAtomic from './images/atomic/menu-ru.png';
import imageSvAtomic from './images/atomic/menu-sv.png';
import imageTrAtomic from './images/atomic/menu-tr.png';
import imageZhCnAtomic from './images/atomic/menu-zh-cn.png';
import imageZhTwAtomic from './images/atomic/menu-zh-tw.png';
import imageArSimple from './images/simple/menu-ar.png';
import imageDeSimple from './images/simple/menu-de.png';
import imageEnSimple from './images/simple/menu-en.png';
import imageEsSimple from './images/simple/menu-es.png';
import imageFrSimple from './images/simple/menu-fr.png';
import imageHeSimple from './images/simple/menu-he.png';
import imageIdSimple from './images/simple/menu-id.png';
import imageItSimple from './images/simple/menu-it.png';
import imageJaSimple from './images/simple/menu-ja.png';
import imageKoSimple from './images/simple/menu-ko.png';
import imageNlSimple from './images/simple/menu-nl.png';
import imagePtBrSimple from './images/simple/menu-pt-br.png';
import imageRuSimple from './images/simple/menu-ru.png';
import imageSvSimple from './images/simple/menu-sv.png';
import imageTrSimple from './images/simple/menu-tr.png';
import imageZhCnSimple from './images/simple/menu-zh-cn.png';
import imageZhTwSimple from './images/simple/menu-zh-tw.png';

const images: Record< string, Record< string, string > > = {
	simple: {
		ar: imageArSimple,
		de: imageDeSimple,
		en: imageEnSimple,
		es: imageEsSimple,
		fr: imageFrSimple,
		he: imageHeSimple,
		id: imageIdSimple,
		it: imageItSimple,
		ja: imageJaSimple,
		ko: imageKoSimple,
		nl: imageNlSimple,
		'pt-br': imagePtBrSimple,
		ru: imageRuSimple,
		sv: imageSvSimple,
		tr: imageTrSimple,
		'zh-cn': imageZhCnSimple,
		'zh-tw': imageZhTwSimple,
	},
	atomic: {
		ar: imageArAtomic,
		de: imageDeAtomic,
		en: imageEnAtomic,
		es: imageEsAtomic,
		fr: imageFrAtomic,
		he: imageHeAtomic,
		id: imageIdAtomic,
		it: imageItAtomic,
		ja: imageJaAtomic,
		ko: imageKoAtomic,
		nl: imageNlAtomic,
		'pt-br': imagePtBrAtomic,
		ru: imageRuAtomic,
		sv: imageSvAtomic,
		tr: imageTrAtomic,
		'zh-cn': imageZhCnAtomic,
		'zh-tw': imageZhTwAtomic,
	},
};

const JetpackNewsletter = () => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isSiteAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const wpAdminUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'admin.php?page=jetpack#newsletter' )
	) as string;
	const userLocale = useSelector( getCurrentUserLocale );
	const imagesForSite = images[ isSiteAtomic ? 'atomic' : 'simple' ];
	const image = imagesForSite[ userLocale ] ?? imagesForSite.en;

	let description;
	let buttonText;
	let buttonLink;
	let areTranslationsReady = hasEnTranslation( 'Newsletter has moved' );
	if ( isSiteAtomic ) {
		areTranslationsReady =
			areTranslationsReady &&
			hasEnTranslation(
				'Newsletter is now part of Jetpack. Access it via Jetpack → Settings → Newsletter in your dashboard.'
			) &&
			hasEnTranslation( 'Go to Jetpack Settings' );
		description = translate(
			'Newsletter is now part of Jetpack. Access it via Jetpack → Settings → Newsletter in your dashboard.'
		);
		buttonText = translate( 'Go to Jetpack Settings' );
		buttonLink = wpAdminUrl;
	} else {
		areTranslationsReady =
			areTranslationsReady &&
			hasEnTranslation(
				'Newsletter is now part of Jetpack for enhanced features. Access it via Jetpack → Newsletter in your dashboard.'
			) &&
			hasEnTranslation( 'Go to Jetpack Newsletter' );
		description = translate(
			'Newsletter is now part of Jetpack for enhanced features. Access it via Jetpack → Newsletter in your dashboard.'
		);
		buttonText = translate( 'Go to Jetpack Newsletter' );
		buttonLink = `/settings/newsletter/${ siteSlug }`;
	}

	if ( ! areTranslationsReady ) {
		navigate( buttonLink );
		return null;
	}

	return (
		<Main>
			<DocumentHead title={ translate( 'Newsletter Settings' ) } />
			<FeatureMoved
				icon={ envelope }
				title={ translate( 'Newsletter has moved' ) }
				description={ description }
				buttonText={ buttonText }
				buttonLink={ buttonLink }
				image={ image }
			/>
		</Main>
	);
};

export default JetpackNewsletter;
