import classNames from 'classnames';

const ItemPriceMessage: React.FC< { message: React.ReactNode; expired?: boolean } > = ( {
	message,
	expired = false,
} ) => {
	const messageClass = classNames( 'item-price__message', {
		'item-price__message--expired': expired,
		'item-price__message--active': ! expired,
	} );

	return (
		<div className={ messageClass }>
			<span className="item-price__message--dot"></span>
			<span className="item-price__message--text">{ message }</span>
		</div>
	);
};

export default ItemPriceMessage;
