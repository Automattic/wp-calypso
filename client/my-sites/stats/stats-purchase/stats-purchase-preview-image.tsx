import statsPurchasePreviewPNG from 'calypso/assets/images/stats/purchase-preview.png';

const StatsPurchasePreviewImage = () => {
	// See stats-purchase-svg.tsx for Odyssey/DotCom detection logic if needed.
	return <img src={ statsPurchasePreviewPNG } alt="alt text goes here" />;
};

export default StatsPurchasePreviewImage;
