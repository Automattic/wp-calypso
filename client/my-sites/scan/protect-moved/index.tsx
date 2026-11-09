import { useHasEnTranslation } from '@automattic/i18n-utils';
import { Page } from '@wordpress/admin-ui';
import { shield } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FeatureMoved from 'calypso/components/feature-moved';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import imageAr from './images/menu-ar.webp';
import imageDe from './images/menu-de.webp';
import imageEn from './images/menu-en.webp';
import imageEs from './images/menu-es.webp';
import imageFr from './images/menu-fr.webp';
import imageHe from './images/menu-he.webp';
import imageId from './images/menu-id.webp';
import imageIt from './images/menu-it.webp';
import imageJa from './images/menu-ja.webp';
import imageKo from './images/menu-ko.webp';
import imageNl from './images/menu-nl.webp';
import imagePtBr from './images/menu-pt-br.webp';
import imageRu from './images/menu-ru.webp';
import imageSv from './images/menu-sv.webp';
import imageTr from './images/menu-tr.webp';
import imageZhCn from './images/menu-zh-cn.webp';
import imageZhTw from './images/menu-zh-tw.webp';
import type { ReactNode } from 'react';

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

const ProtectMoved = ( { fallback }: { fallback: ReactNode } ) => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const siteId = useSelector( getSelectedSiteId );
	const protectUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'admin.php?page=jetpack-protect' )
	);
	const userLocale = useSelector( getCurrentUserLocale );
	const image = images[ userLocale ] ?? images.en;

	if (
		! protectUrl ||
		! hasEnTranslation( 'Scan has moved' ) ||
		! hasEnTranslation(
			'Scan is now part of Jetpack Protect. Access it via Jetpack{{space/}}→{{space/}}Protect in your dashboard.'
		) ||
		! hasEnTranslation( 'Go to Jetpack Protect' )
	) {
		return <>{ fallback }</>;
	}

	return (
		<Main fullWidthLayout className="scan">
			<DocumentHead title={ translate( 'Scan' ) } />
			<Page hasPadding showSidebarToggle={ false }>
				<FeatureMoved
					icon={ shield }
					title={ translate( 'Scan has moved' ) }
					description={ translate(
						'Scan is now part of Jetpack Protect. Access it via Jetpack{{space/}}→{{space/}}Protect in your dashboard.',
						{
							comment:
								'"Jetpack → Protect" uses special HTML spaces to prevent the string from being split in separate lines. Please keep the {{space/}} placeholders before and after the arrow.',
							components: {
								space: <>&nbsp;</>,
							},
						}
					) }
					buttonText={ translate( 'Go to Jetpack Protect' ) }
					buttonLink={ protectUrl }
					image={ image }
				/>
			</Page>
		</Main>
	);
};

export default ProtectMoved;
