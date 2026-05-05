import { Card, CardBody } from '@wordpress/components';
import { PropsWithChildren, FC } from 'react';

type AppsCardProps = PropsWithChildren< {
	logo: string;
	title: string;
	subtitle: string;
} >;

export const AppsCard: FC< AppsCardProps > = ( { logo, title, subtitle, children } ) => {
	return (
		<Card isRounded={ false } className="get-apps__card">
			<CardBody>
				<div className="get-apps__card-header">
					<img
						src={ logo }
						alt=""
						aria-hidden="true"
						width={ 64 }
						height={ 64 }
						className="get-apps__card-logo"
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
