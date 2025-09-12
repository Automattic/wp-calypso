import { __experimentalHStack as HStack } from '@wordpress/components';
import { isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import RouterLinkButton from '../router-link-button';
import type { BreadcrumbsProps } from './types';
import './style.scss';

export const Breadcrumbs = ( { items }: BreadcrumbsProps ) => {
	if ( items.length === 0 ) {
		return null;
	}

	// Single item - render as back button with chevron
	if ( items.length === 1 ) {
		const item = items[ 0 ];

		return (
			<RouterLinkButton
				className="dashboard-breadcrumbs__button"
				icon={ isRTL() ? chevronRight : chevronLeft }
				to={ item.to }
				params={ item.params }
			>
				{ item.label }
			</RouterLinkButton>
		);
	}

	// Multiple items - render as breadcrumb trail
	return (
		<HStack spacing={ 0 } className="dashboard-breadcrumbs" alignment="center" justify="flex-start">
			{ items.map( ( item, index ) => {
				return (
					<span key={ index }>
						<RouterLinkButton
							className="dashboard-breadcrumbs__button"
							to={ item.to }
							params={ item.params }
						>
							{ item.label }
						</RouterLinkButton>

						<span className="dashboard-breadcrumbs__separator">/</span>
					</span>
				);
			} ) }
		</HStack>
	);
};

export default Breadcrumbs;
