import { Gridicon } from '@automattic/components';
import classNames from 'classnames';

const CheckoutTermsItem = ( {
	children,
	className,
	onClick,
	wrapChildren = true,
}: {
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
	wrapChildren?: boolean;
} ): JSX.Element => {
	return (
		<div
			className={ classNames( 'checkout-terms-item', className ) }
			onClick={ onClick }
			role="presentation"
		>
			<Gridicon icon="info-outline" size={ 18 } />
			{ wrapChildren ? <p>{ children }</p> : children }
		</div>
	);
};

export default CheckoutTermsItem;
