import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import HelpCenter from '../app/help-center/help-center';

const A4A_BOT_SLUG = 'automattic-chat-support_a4a';

export default function A4AHelpCenter() {
	const { data: agency } = useQuery( activeAgencyQuery() );

	return (
		<HelpCenter
			product="a4a"
			newInteractionsBotSlug={ A4A_BOT_SLUG }
			agency={
				agency ? { id: agency.id, pressableId: agency.third_party?.pressable?.pressable_id } : null
			}
		/>
	);
}
