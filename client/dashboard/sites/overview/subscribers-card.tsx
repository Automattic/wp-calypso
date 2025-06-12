import { __ } from '@wordpress/i18n';
import { envelope } from '@wordpress/icons';
import OverviewCard from '../overview-card';

export default function SubscribersCard( { subscribers }: { subscribers: number } ) {
	return (
		<OverviewCard
			title={ __( 'Subscribers' ) }
			icon={ envelope }
			heading={ `${ subscribers }` }
			isLink
		/>
	);
}
