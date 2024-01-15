import statsPurchasePreviewPNG from 'calypso/assets/images/stats/purchase-stats-preview.png';
import statsPurchasePreviewSVG from 'calypso/assets/images/stats/purchase-stats-preview.svg';

const StatsPreviewSVG = ( props: any ) => {
	// See stats-purchase-svg.tsx for Odyssey/DotCom detection logic if needed.
	// Checks the useSvg prop and draws the SVG or PNG accordingly.
	// The SVG is rather large but definitely looks better when rendered.

	if ( props.useSvg ) {
		return <img src={ statsPurchasePreviewSVG } alt="hello world" />;
	}

	return <img src={ statsPurchasePreviewPNG } alt="hello world" />;
};

export default StatsPreviewSVG;
