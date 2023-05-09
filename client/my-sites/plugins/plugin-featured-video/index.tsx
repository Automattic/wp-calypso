import { useTranslate } from 'i18n-calypso';
import './style.scss';

interface PluginFeaturedVideoVideoProps {
	id: string;
	src: string;
	productName: string;
}

export const PluginFeaturedVideo = ( { id, src, productName }: PluginFeaturedVideoVideoProps ) => {
	const translate = useTranslate();

	const getIframeTitle = () =>
		translate( '%s Product Video', { args: [ productName ], textOnly: true } );

	return (
		<iframe
			className="plugin-featured-video__iframe"
			id={ id }
			src={ src }
			title={ getIframeTitle() }
			loading="lazy"
		/>
	);
};
