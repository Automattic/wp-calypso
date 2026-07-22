import { referralsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import useBuildCurrentRouteLink from '../../../../app/hooks/use-build-current-route-link';
import Switcher from '../../../../components/switcher';
import { Text } from '../../../../components/text';
import type { SwitcherProps } from '../../../../components/switcher';
import type { Referral } from '@automattic/api-core';

const searchableFields = [
	{
		id: 'client',
		getValue: ( { item }: { item: Referral } ) => item.client.email,
		enableGlobalSearch: true,
	},
];

export type ReferralSwitcherProps = Pick< SwitcherProps< Referral >, 'renderToggle' > & {
	referral: Referral;
	agencyId: number;
};

export default function ReferralSwitcher( {
	referral,
	agencyId,
	renderToggle,
}: ReferralSwitcherProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const { data: referrals } = useQuery( { ...referralsQuery( agencyId ), enabled: isOpen } );
	const buildCurrentRouteLink = useBuildCurrentRouteLink();

	return (
		<Switcher< Referral >
			items={ referrals }
			value={ referral }
			searchableFields={ searchableFields }
			headerTitle={ __( 'Switch referral' ) }
			getItemUrl={ ( item ) =>
				buildCurrentRouteLink( { params: { referralId: String( item.id ) } } )
			}
			renderToggle={ renderToggle }
			renderItem={ ( { item } ) => (
				<Switcher.Item
					title={
						<Text truncate numberOfLines={ 1 } style={ { color: 'inherit' } }>
							{ item.client.email }
						</Text>
					}
				/>
			) }
			open={ isOpen }
			onToggle={ setIsOpen }
		/>
	);
}
