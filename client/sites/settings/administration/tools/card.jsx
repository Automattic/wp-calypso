import { Button } from '@automattic/components';
import clsx from 'clsx';
import { PanelCard, PanelCardDescription, PanelCardHeading } from 'calypso/components/panel';
import SiteToolsLink from 'calypso/my-sites/site-settings/site-tools/link';
import { isHostingMenuUntangled } from '../../utils';

export default function AdministrationToolCard( props ) {
	const { description, href, isWarning, onClick, title } = props;

	if ( ! isHostingMenuUntangled() ) {
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
