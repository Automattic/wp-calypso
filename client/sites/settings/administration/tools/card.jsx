import { Button } from '@automattic/components';
import clsx from 'clsx';
import SiteToolsLink from 'calypso/my-sites/site-settings/site-tools/link';
import { PanelDescription, PanelHeading, PanelSection } from 'calypso/sites/components/panel';
import { isHostingMenuUntangled } from '../../utils';

export default function AdministrationToolCard( props ) {
	const { description, href, isWarning, onClick, title } = props;

	if ( ! isHostingMenuUntangled() ) {
		return <SiteToolsLink { ...props } />;
	}

	return (
		<PanelSection>
			<PanelHeading>{ title }</PanelHeading>
			<PanelDescription>{ description }</PanelDescription>
			<Button href={ href } onClick={ onClick } className={ clsx( { 'is-scary': isWarning } ) }>
				{ title }
			</Button>
		</PanelSection>
	);
}
