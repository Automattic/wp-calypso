import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import PageSection, { PageSectionProps } from 'calypso/a8c-for-agencies/components/page-section';

import './style.scss';

type Props = Omit< PageSectionProps, 'children' > & {
	items: string[];
	fiveRows?: boolean;
	threeRows?: boolean;
};

export default function HostingAdditionalFeaturesSection( {
	icon,
	heading,
	subheading,
	background,
	description,
	items,
	fiveRows,
	threeRows,
}: Props ) {
	return (
		<PageSection
			icon={ icon }
			heading={ heading }
			subheading={ subheading }
			background={ background }
			description={ description }
		>
			<ul
				className={ clsx( 'hosting-additional-features', {
					'is-five-rows': fiveRows,
					'is-three-rows': threeRows,
				} ) }
			>
				{ items.map( ( item, itemIndex ) => (
					<li key={ `additional-features-item-${ itemIndex }` }>
						<Icon className="gridicon" icon={ check } size={ 24 } /> { item }
					</li>
				) ) }
			</ul>
		</PageSection>
	);
}
