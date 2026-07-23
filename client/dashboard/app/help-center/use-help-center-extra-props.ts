import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import type HelpCenter from '@automattic/help-center';
import type { HelpCenterProduct } from '@automattic/help-center';
import type { ComponentProps } from 'react';

type HelpCenterProps = ComponentProps< typeof HelpCenter >;

const A4A_BOT_SLUG = 'automattic-chat-support_a4a';

/**
 * Returns the Help Center prop overrides for a given product, or empty when the
 * product needs none.
 */
export function useHelpCenterExtraProps(
	product?: HelpCenterProduct
): Partial< Pick< HelpCenterProps, 'newInteractionsBotSlug' | 'agency' > > {
	const { data: agency } = useQuery( { ...activeAgencyQuery(), enabled: product === 'a4a' } );

	if ( product === 'a4a' ) {
		return {
			newInteractionsBotSlug: A4A_BOT_SLUG,
			agency: agency
				? { id: agency.id, pressableId: agency.third_party?.pressable?.pressable_id }
				: null,
		};
	}

	return {};
}
