import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import DefensiveModeForm from 'calypso/sites/settings/web-server/defensive-mode-form';

type DefensiveModeCardProps = {
	disabled?: boolean;
};

export default function DefensiveModeCard( { disabled }: DefensiveModeCardProps ) {
	return (
		<DefensiveModeForm
			ContainerComponent={ HostingCard }
			DescriptionComponent={ HostingCardDescription }
			disabled={ disabled }
		/>
	);
}
