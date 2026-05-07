import { Card, CardBody } from '@wordpress/components';
import { PropsWithChildren, FC } from 'react';
import SVGIcon from 'calypso/components/svg-icon';

type AppsCardProps = PropsWithChildren< {
	logo: string;
	logoName: string;
	title: string;
	subtitle: string;
} >;

export const AppsCard: FC< AppsCardProps > = ( { logo, logoName, title, subtitle, children } ) => {
	return (
		<Card isRounded={ false } className="get-apps__card">
			<CardBody>
				<div className="get-apps__card-header">
					<SVGIcon
						name={ logoName }
						aria-hidden="true"
						size={ 64 }
						viewBox="0 0 64 64"
						icon={ logo }
						classes="get-apps__card-logo"
					/>
					<div className="get-apps__card-title-container">
						<h2 className="get-apps__card-title">{ title }</h2>
						<p className="get-apps__card-subtitle">{ subtitle }</p>
					</div>
				</div>
				{ children && <div className="get-apps__card-content">{ children }</div> }
			</CardBody>
		</Card>
	);
};
