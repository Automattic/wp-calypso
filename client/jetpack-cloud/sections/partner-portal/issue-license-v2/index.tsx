import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/jetpack-cloud/components/layout';
import LayoutBody from 'calypso/jetpack-cloud/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions,
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/jetpack-cloud/components/layout/header';
import LayoutTop from 'calypso/jetpack-cloud/components/layout/top';

export default function IssueLicenseV2() {
	const translate = useTranslate();
	return (
		<Layout
			className="issue-license-v2"
			title={ translate( 'Issue a new License' ) }
			wide
			withBorder
		>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ translate( 'Issue product licenses' ) } </Title>
					<Subtitle>
						{ translate( 'Select single product licenses or save when you issue in bulk' ) }
					</Subtitle>

					<LayoutHeaderActions>
						<Button primary>Issue license </Button>
					</LayoutHeaderActions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<div>body here</div>
			</LayoutBody>
		</Layout>
	);
}
