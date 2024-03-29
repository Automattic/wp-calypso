import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';

import './style.scss';

export default function Landing() {
	const translate = useTranslate();
	const title = translate( 'Landing page.' );

	return (
		<Layout title={ title } wide>
			<LayoutTop>
				<LayoutHeader className="a4a-overview-header">
					<Title>{ title }</Title>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>Fetching..</LayoutBody>
		</Layout>
	);
}
