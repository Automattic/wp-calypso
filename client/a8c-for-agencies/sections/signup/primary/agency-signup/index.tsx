import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';

export default function AgencySignup() {
	return (
		<Layout title="Sign Up" wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>Sign up for Automattic for Agencies</Title>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<div>Form</div>
			</LayoutBody>
		</Layout>
	);
}
