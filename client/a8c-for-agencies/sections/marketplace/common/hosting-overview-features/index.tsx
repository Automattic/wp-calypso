import { Icon } from '@wordpress/icons';

import './style.scss';

type Props = {
	items: {
		icon: JSX.Element;
		title: string;
		description: string;
	}[];
};

export default function HostingOverviewFeatures( { items }: Props ) {
	return (
		<div className="hosting-overview-features">
			{ items.map( ( { icon, title, description } ) => (
				<div className="hosting-overview-features__item" key={ title }>
					<Icon className="hosting-overview-features__item-icon" icon={ icon } size={ 48 } />

					<div className="hosting-overview-features__item-content">
						<div className="hosting-overview-features__item-title">{ title }</div>
						<div className="hosting-overview-features__item-description">{ description }</div>
					</div>
				</div>
			) ) }
		</div>
	);
}
