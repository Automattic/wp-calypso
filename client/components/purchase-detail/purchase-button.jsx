import { Button, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { isOutsideCalypso } from 'calypso/lib/url';

const PurchaseButton = ( {
	className,
	href,
	disabled,
	onClick,
	target,
	rel,
	text,
	primary = true,
} ) => {
	return (
		<Button
			className={ clsx( 'purchase-detail__button', className ) }
			disabled={ disabled }
			href={ localizeUrl( href ) }
			onClick={ onClick }
			target={ target }
			rel={ rel }
			primary={ primary }
		>
			{ text } { isOutsideCalypso( href ) && <Gridicon icon="external" /> }
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
