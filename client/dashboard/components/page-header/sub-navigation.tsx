import { Breadcrumbs } from '@automattic/components/src/breadcrumbs';
import RouterLinkButton from '../router-link-button';
import type { SubNavigationProps } from './types';

import './style.scss';

export const SubNavigation = ( props: SubNavigationProps ) => {
	if ( props.items.length < 1 ) {
		return null;
	}

	// if ( props.items.length === 2 ) {
	// 	return (
	// 		<RouterLinkButton
	// 			className="sub-navigation__button"
	// 			icon={ isRTL() ? chevronRight : chevronLeft }
	// 			to={ props.items[ 0 ].href }
	// 		>
	// 			{ props.items[ 0 ].label }
	// 		</RouterLinkButton>
	// 	);
	// }

	return (
		<Breadcrumbs
			items={ props.items }
			renderItemLink={ ( item ) => (
				<RouterLinkButton className="sub-navigation__button" to={ item.href }>
					{ item.label }
				</RouterLinkButton>
			) }
		/>
	);
};
