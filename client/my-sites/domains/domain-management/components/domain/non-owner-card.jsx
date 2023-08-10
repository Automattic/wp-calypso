import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import { getSelectedDomain } from 'calypso/lib/domains';

const NonOwnerCard = ( { domains, redesigned = false, selectedDomainName } ) => {
	const translate = useTranslate();
	const domain = getSelectedDomain( { domains, selectedDomainName } );

	if ( ! domains || ! domain ) {
		return null;
	}

	const text = translate(
		'These settings can be changed by the user {{strong}}%(owner)s{{/strong}}.',
		{
			components: {
				strong: <strong />,
			},
			args: {
				owner: domain.owner,
			},
		}
	);

	return ! redesigned ? (
		<Notice status="is-warning" showDismiss={ false } text={ text } />
	) : (
		<div className="non-owner-card">
			<Icon
				icon={ info }
				size={ 18 }
				className="non-owner-card__icon gridicon"
				viewBox="2 2 20 20"
			/>
			<div className="non-owner-card__message">{ text }</div>
		</div>
	);
};

export default NonOwnerCard;
