import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import HeaderCart from 'calypso/my-sites/checkout/cart/header-cart';

import './style.scss';

function EmailHeader( { currentRoute, selectedSite } ) {
	const translate = useTranslate();

	return (
		<div className="email-header">
			<FormattedHeader
				brandFont
				headerText={ translate( 'Emails' ) }
				subHeaderText={ translate(
					'Your home base for accessing, setting up, and managing your emails. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="emails" showIcon={ false } />,
						},
					}
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
