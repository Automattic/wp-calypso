import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { check } from '@wordpress/icons';
import clsx from 'clsx';
import { Card, CardBody } from '../../../components/card';

export type OptionCardItem = {
	value: string;
	label: string;
	description: string;
};

type OptionCardsProps = {
	label: string;
	options: OptionCardItem[];
	selected: string;
	onSelect: ( value: string ) => void;
};

export default function OptionCards( { label, options, selected, onSelect }: OptionCardsProps ) {
	return (
		<div className="marketplace-hosting__option-grid" role="radiogroup" aria-label={ label }>
			{ options.map( ( option ) => {
				const isSelected = option.value === selected;
				return (
					<Card
						key={ option.value }
						className={ clsx( 'marketplace-hosting__selector-card', {
							'is-selected': isSelected,
						} ) }
						onClick={ () => onSelect( option.value ) }
						role="radio"
						aria-checked={ isSelected }
						tabIndex={ 0 }
						onKeyDown={ ( event: React.KeyboardEvent ) => {
							if ( event.key === 'Enter' || event.key === ' ' ) {
								event.preventDefault();
								onSelect( option.value );
							}
						} }
					>
						<CardBody>
							<VStack spacing={ 2 }>
								<HStack justify="space-between" alignment="center">
									<Text weight={ 600 }>{ option.label }</Text>
									<Icon
										icon={ check }
										className={ clsx( 'marketplace-hosting__selector-check', {
											'is-hidden': ! isSelected,
										} ) }
									/>
								</HStack>
								<Text variant="muted">{ option.description }</Text>
							</VStack>
						</CardBody>
					</Card>
				);
			} ) }
		</div>
	);
}
