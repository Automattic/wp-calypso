import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenterSite } from '@automattic/data-stores';
import { GetSupport } from '@automattic/odie-client/src/components/message/get-support';
import { useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { useNavigate } from 'react-router-dom';
import useChatStatus from '../hooks/use-chat-status';
import { useResetSupportInteraction } from '../hooks/use-reset-support-interaction';
import ThirdPartyCookiesNotice from './help-center-third-party-cookies-notice';

import './help-center-contact-support-option.scss';

interface HelpCenterContactSupportOptionProps {
	productId: number | undefined;
	sectionName: string;
	site: HelpCenterSite;
	triggerSource?: string;
	articleUrl?: string | null | undefined;
	trackEventName?: string;
}

const HelpCenterContactSupportOption = ( { sectionName }: HelpCenterContactSupportOptionProps ) => {
	const { isEligibleForChat } = useChatStatus();
	const navigate = useNavigate();
	const { data: canConnectToZendesk } = useCanConnectToZendeskMessaging();
	const resetSupportInteraction = useResetSupportInteraction();

	const handleContactSupportClick = async ( destination: string ) => {
		recordTracksEvent( 'calypso_odie_chat_get_support', {
			location: 'help-center',
			section: sectionName,
			destination,
			is_user_eligible: isEligibleForChat,
		} );
		if ( isEligibleForChat ) {
			await resetSupportInteraction();
			navigate( '/odie' );
		}
	};

	return (
		<>
			{ ! canConnectToZendesk && <ThirdPartyCookiesNotice /> }
			<GetSupport
				onClickAdditionalEvent={ handleContactSupportClick }
				isUserEligibleForPaidSupport={ isEligibleForChat }
				canConnectToZendesk={ canConnectToZendesk }
			/>
		</>
	);
};

export default HelpCenterContactSupportOption;
