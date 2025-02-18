import { Button } from '@automattic/components';
import clsx from 'clsx';
import { PanelCard, PanelCardDescription, PanelCardHeading } from 'calypso/components/panel';
import { useRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
import SiteToolsLink from 'calypso/my-sites/site-settings/site-tools/link';

export default function AdministrationToolCard( props ) {
	const { description, href, isWarning, onClick, title } = props;

	const isUntangled = useRemoveDuplicateViewsExperimentEnabled();

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
