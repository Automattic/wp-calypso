import clsx from 'clsx';
import PropTypes from 'prop-types';

const SharingServiceExample = ( { image, label, single } ) => (
	<div className={ clsx( 'sharing-service-example', { 'is-single': single } ) }>
		{ image ? (
			<div className="service-example__screenshot">
				<img src={ image.src } alt={ image.alt } />
			</div>
		) : null }
		<div className="service-example__screenshot-label">{ label }</div>
	</div>
);

SharingServiceExample.propTypes = {
	image: PropTypes.shape( {
		src: PropTypes.string,
		alt: PropTypes.string,
	} ),
	label: PropTypes.node,
	single: PropTypes.bool,
};

SharingServiceExample.defaultProps = {
	single: false,
};

export default SharingServiceExample;
