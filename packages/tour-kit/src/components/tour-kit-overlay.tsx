/**
 * External Dependencies
 */
import clsx from 'clsx';

interface Props {
	visible: boolean;
}

const TourKitOverlay: React.FunctionComponent< Props > = ( { visible } ) => {
	return (
		<div
			className={ clsx( 'tour-kit-overlay', {
				'is-visible': visible,
			} ) }
		/>
	);
};

export default TourKitOverlay;
