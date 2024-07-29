import clsx from 'clsx';

export type ItemPriceMessageProps = {
	active?: boolean;
	error?: boolean;
	message: React.ReactNode;
};

const ItemPriceMessage: React.FC< ItemPriceMessageProps > = ( {
	active = false,
	error = false,
	message,
} ) => {
	const messageClass = clsx( 'item-price__message', {
		'item-price__message--active': active && ! error,
		'item-price__message--error': error,
	} );

	return (
		<div className={ messageClass }>
			<span className="item-price__message--dot"></span>
			<span className="item-price__message--text">{ message }</span>
		</div>
	);
};

export default ItemPriceMessage;
