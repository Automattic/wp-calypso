import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import CacheForm from 'calypso/sites/settings/caches/form';

type CacheCardProps = {
	disabled?: boolean;
};

export default function CacheCard( { disabled }: CacheCardProps ) {
	return (
		<CacheForm
			ContainerComponent={ HostingCard }
			DescriptionComponent={ HostingCardDescription }
			SubdescriptionComponent={ HostingCardDescription }
			disabled={ disabled }
		/>
	);
}
