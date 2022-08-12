import { BlankCanvas } from 'calypso/components/blank-canvas';
// import { useEffect } from 'react';

export type BlazePressPromotionProps = {
	isVisible: boolean;
	isLoading: boolean;
	onClose: () => void;
};

const BlazePressPromotion = ( props: BlazePressPromotionProps ) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
	const { isVisible = false, isLoading = true, onClose = () => {} } = props;

	// Scroll to top on initial load regardless of previous page position
	// useEffect( () => {
	// 	if ( isVisible ) {
	// 		window.scrollTo( 0, 0 );
	// 	}
	// }, [ isVisible ] );

	return (
		<>
			{ isVisible && (
				<BlankCanvas className={ 'blazepress-blank-canvas' }>
					<BlankCanvas.Content>
						{ isLoading && <div>isLoading</div> }
						<div id="promote__widget-container"></div>
					</BlankCanvas.Content>
				</BlankCanvas>
			) }
		</>
	);
};

export default BlazePressPromotion;
