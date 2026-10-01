import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { check } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import clsx from 'clsx';
import { Card, CardBody } from '../../../components/card';

export interface OptionCardItem {
	value: string;
	label: string;
	description: string;
	/** Can't be picked, such as a plan type below the plan the agency owns. */
	disabled?: boolean;
	/** A short status top right, such as why it can't be picked. */
	tag?: string;
}

export default function OptionCards( {
	label,
	options,
	selected,
	onSelect,
}: {
	label: string;
	options: OptionCardItem[];
	selected: string;
	onSelect: ( value: string ) => void;
} ) {
	return (
		<div
			className="dashboard-marketplace-hosting__option-grid"
			role="radiogroup"
			aria-label={ label }
		>
			{ options.map( ( option ) => {
				const isSelected = option.value === selected;
				const select = () => {
					if ( ! option.disabled ) {
						onSelect( option.value );
					}
				};
				return (
					<Card
						key={ option.value }
						className={ clsx( 'dashboard-marketplace-hosting__option-card', {
							'is-selected': isSelected,
							'is-disabled': option.disabled,
						} ) }
						role="radio"
						aria-checked={ isSelected }
						aria-disabled={ option.disabled }
						tabIndex={ option.disabled ? -1 : 0 }
						onClick={ select }
						onKeyDown={ ( event: React.KeyboardEvent ) => {
							if ( event.key === 'Enter' || event.key === ' ' ) {
								event.preventDefault();
								select();
							}
						} }
					>
						<CardBody>
							<VStack spacing={ 2 }>
								<HStack justify="space-between" alignment="center">
									<Text weight={ 600 }>{ option.label }</Text>
									{ /* The tag sits top right, where the check goes, so the text lines up across the cards. */ }
									<HStack spacing={ 2 } justify="flex-end" expanded={ false }>
										{ option.tag && (
											<Badge className="dashboard-marketplace-hosting__option-tag">
												{ option.tag }
											</Badge>
										) }
										{ ( isSelected || ! option.tag ) && (
											<Icon
												icon={ check }
												className="dashboard-marketplace-hosting__option-check"
											/>
										) }
									</HStack>
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
