import { Icon, check } from '@wordpress/icons';
import PageSection, { PageSectionProps } from 'calypso/a8c-for-agencies/components/page-section';

import './style.scss';

type Props = Omit< PageSectionProps, 'children' > & {
	className?: string;
	items: {
		title: string;
		description: string;
		benefits: string[];
	}[];
};

export default function HostingBenefitsSection( {
	className,
	icon,
	heading,
	subheading,
	background,
	description,
	items,
}: Props ) {
	return (
		<PageSection
			className={ className }
			icon={ icon }
			heading={ heading }
			subheading={ subheading }
			background={ background }
			description={ description }
		>
			<div className="hosting-benefits">
				{ items.map( ( item, index ) => (
					<div className="hosting-benefits-card" key={ `hosting-benfits-card-${ index }` }>
						<div className="hosting-benefits-card__header">
							<h3 className="hosting-benefits-card__title">{ item.title }</h3>
							<p className="hosting-benefits-card__description">{ item.description }</p>
						</div>

						<ul className="hosting-benefits-card__list">
							{ item.benefits.map( ( benefit, benefitIndex ) => (
								<li key={ `hosting-benefits-card__item-${ index }-${ benefitIndex }` }>
									<Icon className="gridicon" icon={ check } size={ 24 } />
									{ benefit }
								</li>
							) ) }
						</ul>
					</div>
				) ) }
			</div>
		</PageSection>
	);
}
