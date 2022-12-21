import classNames from 'classnames';
import './masterbar-cart-count.scss';

type MasterbarCartCountProps = {
	cartCount: number;
};

export function MasterBarCartCount( { cartCount }: MasterbarCartCountProps ) {
	const classes = classNames( 'masterbar-cart-count', {
		'masterbar-cart-count__hidden': cartCount <= 0,
	} );
	return <span className={ classes }>{ cartCount }</span>;
}
