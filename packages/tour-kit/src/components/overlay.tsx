/**
 * External Dependencies
 */
import classnames from 'classnames';

interface Props {
	visible: boolean;
}

const Overlay: React.FunctionComponent< Props > = ( { visible } ) => {
	return (
		<div
			className={ classnames( 'tour-kit__overlay', {
				'--visible': visible,
			} ) }
		/>
	);
};

export default Overlay;
