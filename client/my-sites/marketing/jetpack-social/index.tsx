import { useHasEnTranslation } from '@automattic/i18n-utils';
import { share } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import FeatureMoved from 'calypso/components/feature-moved';
import { navigate } from 'calypso/lib/navigate';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
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

const JetpackSocial = () => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const siteId = useSelector( getSelectedSiteId );
	const isPrivate = useSelector( ( state ) => isPrivateSite( state, siteId ) );
	const wpAdminUrl = useSelector( ( state ) =>
		getSiteAdminUrl(
			state,
			siteId,
			isPrivate ? 'options-reading.php' : 'admin.php?page=jetpack-social'
		)
	) as string;
	const userLocale = useSelector( getCurrentUserLocale );
	const image = images[ userLocale ] ?? images.en;

	if (
		! hasEnTranslation( 'Social connections have moved' ) ||
		! hasEnTranslation(
			'Social connections are now part of Jetpack for enhanced features. Access them via Jetpack → Social in your dashboard.'
		) ||
		( ! isPrivate && ! hasEnTranslation( 'Go to Jetpack Social' ) ) ||
		( isPrivate && ! hasEnTranslation( 'Go to Reading Settings' ) ) ||
		( isPrivate &&
			! hasEnTranslation(
				'Jetpack Social is only available if your site is not private. You can control who can view your site from Settings → Reading.'
			) )
	) {
		navigate( wpAdminUrl );
		return null;
	}

	return (
		<div className="jetpack-social">
			<FeatureMoved
				icon={ share }
				title={ translate( 'Social connections have moved' ) }
				description={
					<>
						{ translate(
							'Social connections are now part of Jetpack for enhanced features. Access them via Jetpack → Social in your dashboard.'
						) }
						{ isPrivate && (
							<>
								<br />
								<br />
								{ translate(
									'Jetpack Social is only available if your site is not private. You can control who can view your site from Settings → Reading.'
								) }
							</>
						) }
					</>
				}
				buttonText={
					isPrivate ? translate( 'Go to Reading Settings' ) : translate( 'Go to Jetpack Social' )
				}
				buttonLink={ wpAdminUrl }
				image={ image }
			/>
		</div>
	);
};

export default JetpackSocial;
