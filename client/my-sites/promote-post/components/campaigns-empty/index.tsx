import { translate } from 'i18n-calypso';
import megaphoneIllustration from 'calypso/assets/images/customer-home/illustration--megaphone.svg';
import EmptyContent from 'calypso/components/empty-content';
import './style.scss';

export default function CampaignsEmpty() {
	return (
		<div className="campaigns-empty__container">
			<EmptyContent
				className="campaigns-empty"
				title={ translate( 'Looking for a campaign?' ) }
				line="There are no running campaigns now."
				action="Start a campaign"
				actionURL="todo"
				secondaryAction="Learn more"
				secondaryActionURL="todo"
				illustration={ megaphoneIllustration }
				illustrationWidth={ 150 }
			/>
		</div>
	);
}
