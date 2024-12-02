import { useTranslate } from 'i18n-calypso';
import { PanelCard, PanelCardDescription, PanelCardHeading } from 'calypso/components/panel';
import HostingActivationButton from './hosting-activation-button';

export default function HostingActivation( { redirectUrl }: { redirectUrl: string } ) {
	const translate = useTranslate();

	return (
		<PanelCard>
			<PanelCardHeading>{ translate( 'Activate hosting features' ) }</PanelCardHeading>
			<PanelCardDescription>
				{ translate( 'Activate now to start using this hosting feature.' ) }
			</PanelCardDescription>
			<HostingActivationButton redirectUrl={ redirectUrl } />
		</PanelCard>
	);
}
