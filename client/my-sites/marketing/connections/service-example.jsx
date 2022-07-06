import classNames from 'classnames';
import PropTypes from 'prop-types';

const SharingServiceExample = ( { image, label, single } ) => (
	<div className={ classNames( 'sharing-service-example', { 'is-single': single } ) }>
		<div className="service-example__screenshot">
			<img src={ image.src } alt={ image.alt } />
		</div>
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
