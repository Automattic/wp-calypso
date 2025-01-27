import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { TranslateResult } from 'i18n-calypso';
import PageSection, { PageSectionProps } from 'calypso/a8c-for-agencies/components/page-section';

import './style.scss';

type Props = Omit< PageSectionProps, 'children' > & {
	items: TranslateResult[];
	threeRows?: boolean;
	fourRows?: boolean;
	fiveRows?: boolean;
};

export default function HostingAdditionalFeaturesSection( {
	icon,
	heading,
	subheading,
	background,
	description,
	items,
	threeRows,
	fourRows,
	fiveRows,
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
					'is-three-rows': threeRows,
					'is-four-rows': fourRows,
					'is-five-rows': fiveRows,
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
