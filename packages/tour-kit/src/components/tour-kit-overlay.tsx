/**
 * External Dependencies
 */
import classnames from 'classnames';

interface Props {
	visible: boolean;
}

const TourKitOverlay: React.FunctionComponent< Props > = ( { visible } ) => {
	return (
		<div
			className={ classnames( 'tour-kit-overlay', {
				'is-visible': visible,
			} ) }
		/>
	);
};

export default TourKitOverlay;
