const ItemPriceMessage: React.FC< { message: React.ReactNode } > = ( { message } ) => (
	<div className="item-price__message">
		<span className="item-price__message--dot"></span>
		<span className="item-price__message--text">{ message }</span>
	</div>
);

export default ItemPriceMessage;
