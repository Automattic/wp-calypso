import { useTranslate } from 'i18n-calypso';
import statsPurchasePreviewPNG from 'calypso/assets/images/stats/purchase-preview.png';
import statsPurchasePreviewPNG2xRetina from 'calypso/assets/images/stats/purchase-preview@2x.png';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';

const StatsPurchasePreviewImage = () => {
	const translate = useTranslate();
	// Determine which image to use based on device pixel ratio.
	const previewImage =
		window.devicePixelRatio > 1 ? statsPurchasePreviewPNG2xRetina : statsPurchasePreviewPNG;
	const imageAltText = translate( 'Preview of the full %(product)s dashboard', {
		args: { product: STATS_PRODUCT_NAME },
	} ) as string;

	// See stats-purchase-svg.tsx for Odyssey/DotCom detection logic if needed.
	return <img src={ previewImage } alt={ imageAltText } />;
};

export default StatsPurchasePreviewImage;
