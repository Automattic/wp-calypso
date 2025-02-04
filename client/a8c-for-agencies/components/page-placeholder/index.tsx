import clsx from 'clsx';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, { LayoutHeaderTitle as Title } from 'calypso/layout/hosting-dashboard/header';

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
