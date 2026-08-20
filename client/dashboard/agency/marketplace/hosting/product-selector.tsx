import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import clsx from 'clsx';
import pressableLogo from 'calypso/assets/images/a8c-for-agencies/pressable-logo.svg';
import vipLogo from 'calypso/assets/images/a8c-for-agencies/vip-full-logo.svg';
import wpcomLogo from 'calypso/assets/images/a8c-for-agencies/wpcom-logo.svg';
import { Card, CardBody } from '../../../components/card';
import type { HostingBrand } from './mock-data';

const BRAND_LOGOS: Record< HostingBrand[ 'key' ], string > = {
	wpcom: wpcomLogo,
	pressable: pressableLogo,
	vip: vipLogo,
};

type ProductSelectorProps = {
	brands: HostingBrand[];
	selected: HostingBrand[ 'key' ];
	onSelect: ( key: HostingBrand[ 'key' ] ) => void;
};

export default function ProductSelector( { brands, selected, onSelect }: ProductSelectorProps ) {
	return (
		<div className="marketplace-hosting__selector" role="radiogroup" aria-label="Hosting product">
			{ brands.map( ( brand ) => {
				const isSelected = brand.key === selected;
				return (
					<Card
						key={ brand.key }
						className={ clsx( 'marketplace-hosting__selector-card', {
							'is-selected': isSelected,
						} ) }
						onClick={ () => onSelect( brand.key ) }
						role="radio"
						aria-checked={ isSelected }
						tabIndex={ 0 }
						onKeyDown={ ( event: React.KeyboardEvent ) => {
							if ( event.key === 'Enter' || event.key === ' ' ) {
								event.preventDefault();
								onSelect( brand.key );
							}
						} }
					>
						<CardBody>
							<VStack spacing={ 2 }>
								<HStack spacing={ 2 } justify="flex-start">
									<span
										className={ clsx( 'marketplace-hosting__selector-radio', {
											'is-selected': isSelected,
										} ) }
									/>
									<img
										src={ BRAND_LOGOS[ brand.key ] }
										alt={ brand.name }
										className="marketplace-hosting__selector-logo"
									/>
								</HStack>
								<Text variant="muted">{ brand.description }</Text>
								<Text weight={ 500 }>{ brand.priceNote }</Text>
							</VStack>
						</CardBody>
					</Card>
				);
			} ) }
		</div>
	);
}
