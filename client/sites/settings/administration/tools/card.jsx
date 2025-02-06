import { Button } from '@automattic/components';
import clsx from 'clsx';
import { PanelCard, PanelCardDescription, PanelCardHeading } from 'calypso/components/panel';
import SiteToolsLink from 'calypso/my-sites/site-settings/site-tools/link';
import { useIsSiteSettingsUntangled } from '../../hooks/use-is-site-settings-untangled';

export default function AdministrationToolCard( props ) {
	const { description, href, isWarning, onClick, title } = props;

	const isUntangled = useIsSiteSettingsUntangled();

	if ( ! isUntangled ) {
		return <SiteToolsLink { ...props } />;
	}

	return (
		<PanelCard>
			<PanelCardHeading>{ title }</PanelCardHeading>
			<PanelCardDescription>{ description }</PanelCardDescription>
			<Button href={ href } onClick={ onClick } className={ clsx( { 'is-scary': isWarning } ) }>
				{ title }
			</Button>
		</PanelCard>
	);
}
