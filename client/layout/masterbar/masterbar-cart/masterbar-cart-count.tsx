import './masterbar-cart-count.scss';
export type MasterbarCartCountProps = {
	cartCount: number;
};

export function MasterBarCartCount( { cartCount }: MasterbarCartCountProps ) {
	return <span className="masterbar-cart-count">{ cartCount }</span>;
}
