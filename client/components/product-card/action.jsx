import { Button } from '@automattic/components';
import PropTypes from 'prop-types';

const noop = () => {};

const ProductCardAction = ( { intro, label, onClick, primary, href } ) => (
	<div className="product-card__action">
		{ intro && <h4 className="product-card__action-intro">{ intro }</h4> }
		<Button
			className="product-card__action-button"
			href={ href }
			onClick={ onClick }
			primary={ primary }
		>
			{ label }
		</Button>
	</div>
);

ProductCardAction.propTypes = {
	intro: PropTypes.node,
	label: PropTypes.string.isRequired,
	onClick: PropTypes.func,
	href: PropTypes.string,
	primary: PropTypes.bool,
};

ProductCardAction.defaultProps = {
	href: null,
	onClick: noop,
	primary: true,
};

export default ProductCardAction;
