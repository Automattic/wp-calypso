import { __experimentalText as Text, Button } from '@wordpress/components';
import { useSelector } from 'react-redux';
import { Callout } from 'calypso/dashboard/components/callout';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
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
import type { Icon } from '@wordpress/components';
import type { ComponentProps } from 'react';

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

const FeatureMoved = ( {
	icon,
	title,
	description,
	buttonText,
	buttonLink,
}: {
	icon: ComponentProps< typeof Icon >[ 'icon' ];
	title: string;
	description: string;
	buttonText: string;
	buttonLink: string;
} ) => {
	const userLocale = useSelector( getCurrentUserLocale );
	const image = images[ userLocale ] ?? images.en;

	return (
		<div className="feature-moved">
			<Callout
				icon={ icon }
				title={ title }
				description={ <Text variant="muted">{ description }</Text> }
				image={ image }
				actions={
					<Button variant="primary" size="compact" href={ buttonLink }>
						{ buttonText }
					</Button>
				}
			/>
		</div>
	);
};

export default FeatureMoved;
