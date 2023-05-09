import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import Notice from 'calypso/components/notice';

const EmailExistingForwardsNotice = ( { domainsWithForwards, selectedDomainName } ) => {
	const translate = useTranslate();

	if ( ! domainsWithForwards.includes( selectedDomainName ) ) {
		return null;
	}

	return (
		<Notice showDismiss={ false } status="is-warning">
			{ translate(
				'Existing email forwards will be removed once you upgrade. Set up the email addresses you want to continue using below.',
				{
					args: {
						domainName: selectedDomainName,
					},
					comment: '%(domainName)s is a domain name, e.g. example.org',
				}
			) }
		</Notice>
	);
};

EmailExistingForwardsNotice.propTypes = {
	domainsWithForwards: PropTypes.arrayOf( PropTypes.string ).isRequired,
	selectedDomainName: PropTypes.string.isRequired,
};

export default EmailExistingForwardsNotice;
