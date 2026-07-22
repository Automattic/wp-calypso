import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import type HelpCenter from '@automattic/help-center';
import type { ComponentProps } from 'react';

type HelpCenterProps = ComponentProps< typeof HelpCenter >;

const A4A_BOT_SLUG = 'automattic-chat-support_a4a';

/**
 * A4A-specific Help Center props (support bot slug + agency context). Returns
 * empty when not enabled so the panel keeps its default configuration.
 */
export function useA4AHelpCenterProps(
	enabled: boolean
): Partial< Pick< HelpCenterProps, 'newInteractionsBotSlug' | 'agency' > > {
	const { data: agency } = useQuery( { ...activeAgencyQuery(), enabled } );

	if ( ! enabled ) {
		return {};
	}

	return {
		newInteractionsBotSlug: A4A_BOT_SLUG,
		agency: agency
			? { id: agency.id, pressableId: agency.third_party?.pressable?.pressable_id }
			: null,
	};
}
