import clsx from 'clsx';
import './masterbar-cart-count.scss';

type MasterbarCartCountProps = {
	cartCount: number;
};

export function MasterBarCartCount( { cartCount }: MasterbarCartCountProps ) {
	const classes = clsx( 'masterbar-cart-count', {
		'masterbar-cart-count__hidden': cartCount <= 0,
	} );
	return <span className={ classes }>{ cartCount }</span>;
}
