import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import AgencyTierLevels from 'calypso/assets/images/a8c-for-agencies/agency-tier/agency-tier-levels.svg';
import getTierPermissionData from '../lib/get-tier-permission-data';

import './style.scss';

export default function TierPermissionError( { section }: { section: string } ) {
	const translate = useTranslate();

	const { title, content } = getTierPermissionData( section, translate );

	return (
		<Layout className="agency-tier-permission-error__layout" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<div className="agency-tier-permission-error__content">
					<div className="agency-tier-permission-error__content-image">
						<img
							className="agency-tier-permission-error__content-image"
							alt="agency-tier-levels"
							src={ AgencyTierLevels }
						/>
					</div>
					<div className="agency-tier-permission-error__content-text">
						<div className="agency-tier-permission-error__content-heading">{ content.heading }</div>
						<div className="agency-tier-permission-error__content-description">
							{ content.description }
						</div>
						<Button href={ content.buttonProps.href } variant="primary">
							{ content.buttonProps.text }
						</Button>
					</div>
				</div>
			</LayoutBody>
		</Layout>
	);
}
