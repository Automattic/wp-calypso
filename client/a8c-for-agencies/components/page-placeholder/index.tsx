import clsx from 'clsx';
import Layout from 'calypso/layout/multi-sites-dashboard';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/layout/multi-sites-dashboard/header';
import LayoutTop from 'calypso/layout/multi-sites-dashboard/top';

import './style.scss';

type Props = {
	title?: string;
	className?: string;
};

export default function PagePlaceholder( { title, className }: Props ) {
	return (
		<Layout className={ clsx( 'a4a-page-placeholder', className ) } title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>
						<div className="a4a-page-placeholder__title-placeholder"></div>
					</Title>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<div className="a4a-page-placeholder__section-placeholder">
					<div className="a4a-page-placeholder__section-placeholder-title"></div>
					<div className="a4a-page-placeholder__section-placeholder-body"></div>
					<div className="a4a-page-placeholder__section-placeholder-footer"></div>
				</div>
			</LayoutBody>
		</Layout>
	);
}
