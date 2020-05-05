/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { localizeUrl } from 'lib/i18n-utils';

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
			className={ classNames( 'purchase-detail__button', className ) }
			disabled={ disabled }
			href={ localizeUrl( href ) }
			onClick={ onClick }
			target={ target }
			rel={ rel }
			primary={ primary }
		>
			{ text }
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
