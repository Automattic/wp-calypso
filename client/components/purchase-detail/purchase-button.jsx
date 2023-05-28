import { Button, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const PurchaseButton = ( {
	className,
	href,
	disabled,
	onClick,
	target,
	rel,
	text,
	icon,
	primary = true,
} ) => {
	return (
		<Button
			className={ classNames( 'purchase-detail__button', className ) }
			disabled={ disabled }
			href={ localizeUrl( href ) }
			onClick={ onClick }
			target={ target }
			rel={ rel }
			primary={ primary }
		>
			{ text } { icon && <Gridicon icon={ icon } /> }
		</Button>
	);
};

PurchaseButton.propTypes = {
	className: PropTypes.string,
	href: PropTypes.string,
	disabled: PropTypes.bool,
	onClick: PropTypes.func,
	target: PropTypes.string,
	rel: PropTypes.string,
	text: PropTypes.string,
	primary: PropTypes.bool,
};

export default PurchaseButton;
