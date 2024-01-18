import statsPurchasePreviewPNG from 'calypso/assets/images/stats/purchase-preview.png';
import statsPurchasePreviewPNG2xRetina from 'calypso/assets/images/stats/purchase-preview@2x.png';

const StatsPurchasePreviewImage = () => {
	// Determine which image to use based on device pixel ratio.
	const previewImage =
		window.devicePixelRatio > 1 ? statsPurchasePreviewPNG2xRetina : statsPurchasePreviewPNG;

	// See stats-purchase-svg.tsx for Odyssey/DotCom detection logic if needed.
	return <img src={ previewImage } alt="alt text goes here" />;
};

export default StatsPurchasePreviewImage;
