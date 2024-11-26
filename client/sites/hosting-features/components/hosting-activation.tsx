import { useTranslate } from 'i18n-calypso';
import { PanelDescription, PanelHeading, PanelSection } from 'calypso/components/panel';
import HostingActivationButton from './hosting-activation-button';

export default function HostingActivation( { redirectUrl }: { redirectUrl: string } ) {
	const translate = useTranslate();

	return (
		<PanelSection>
			<PanelHeading>{ translate( 'Activate hosting features' ) }</PanelHeading>
			<PanelDescription>
				{ translate( 'Activate now to start using this hosting feature.' ) }
			</PanelDescription>
			<HostingActivationButton redirectUrl={ redirectUrl } />
		</PanelSection>
	);
}
