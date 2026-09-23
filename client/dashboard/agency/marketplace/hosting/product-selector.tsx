import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { check } from '@wordpress/icons';
import clsx from 'clsx';
import { Card, CardBody } from '../../../components/card';
import pressableLogo from '../exclusive-offers/images/pressable-descriptor.svg';
import vipLogo from '../exclusive-offers/images/vip-descriptor.svg';
import wpcomLogo from '../exclusive-offers/images/wordpressdotcom-descriptor.svg';
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
							<VStack spacing={ 3 }>
								<HStack justify="space-between" alignment="center">
									<img
										src={ BRAND_LOGOS[ brand.key ] }
										alt={ brand.name }
										className="marketplace-hosting__selector-logo"
									/>
									{ isSelected && (
										<Icon icon={ check } className="marketplace-hosting__selector-check" />
									) }
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
