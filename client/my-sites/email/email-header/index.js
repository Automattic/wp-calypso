/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCart from 'calypso/my-sites/checkout/cart/header-cart';

/**
 * Style dependencies
 */
import './style.scss';

function EmailHeader( { currentRoute, selectedSite } ) {
	const translate = useTranslate();

	return (
		<div className="email-header">
			<FormattedHeader
				brandFont
				headerText={ translate( 'Emails' ) }
				subHeaderText={ translate(
					'Your home base for accessing, setting up, and managing your emails.'
				) }
				align="left"
			/>

			{ selectedSite && (
				<div className="email-header__cart">
					<HeaderCart currentRoute={ currentRoute } selectedSite={ selectedSite } />
				</div>
			) }
		</div>
	);
}

EmailHeader.propTypes = {
	currentRoute: PropTypes.string,
	selectedSite: PropTypes.object.isRequired,
};

export default EmailHeader;
