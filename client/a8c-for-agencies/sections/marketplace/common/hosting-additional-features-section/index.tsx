import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import HostingSection, { HostingSectionProps } from '../hosting-section';

import './style.scss';

type Props = Omit< HostingSectionProps, 'children' > & {
	items: string[];
	fiveRows?: boolean;
};

export default function HostingAdditionalFeaturesSection( {
	icon,
	heading,
	subheading,
	background,
	description,
	items,
	fiveRows,
}: Props ) {
	return (
		<HostingSection
			icon={ icon }
			heading={ heading }
			subheading={ subheading }
			background={ background }
			description={ description }
		>
			<ul className={ clsx( 'hosting-additional-features', { 'is-five-rows': fiveRows } ) }>
				{ items.map( ( item, itemIndex ) => (
					<li key={ `additional-features-item-${ itemIndex }` }>
						<Icon className="gridicon" icon={ check } size={ 24 } /> { item }
					</li>
				) ) }
			</ul>
		</HostingSection>
	);
}
