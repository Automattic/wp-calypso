import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import { getSelectedDomain } from 'calypso/lib/domains';

const NonOwnerCard = ( { domains, selectedDomainName } ) => {
	const translate = useTranslate();
	const domain = getSelectedDomain( { domains, selectedDomainName } );

	return (
		<Notice
			status="is-warning"
			showDismiss={ false }
			text={ translate(
				'These settings can be changed by the user {{strong}}%(owner)s{{/strong}}.',
				{
					components: {
						strong: <strong />,
					},
					args: {
						owner: domain.owner,
					},
				}
			) }
		/>
	);
};

export default NonOwnerCard;
