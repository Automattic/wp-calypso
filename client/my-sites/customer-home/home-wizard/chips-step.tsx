import {
	TextareaControl,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';

type Props = {
	value: string;
	onChange: ( value: string ) => void;
};

type Chip = {
	id: string;
	label: string;
	template: string;
};

const CHIPS: Chip[] = [
	{
		id: 'newsletter',
		label: 'A newsletter',
		template:
			'A weekly newsletter about [topic] for [audience]. Paid posts and a comments section.',
	},
	{
		id: 'store',
		label: 'An online store',
		template: 'An online store selling [products] for [audience]. Stripe checkout and a blog.',
	},
	{
		id: 'portfolio',
		label: 'A portfolio',
		template: 'A portfolio for my [creative work] with case studies and a contact page.',
	},
	{
		id: 'blog',
		label: 'A blog',
		template: 'A personal blog about [topic] with comments and an email subscription.',
	},
	{
		id: 'business',
		label: 'A small business',
		template:
			'A landing page for my [business type] with services, a contact form, and testimonials.',
	},
	{
		id: 'other',
		label: 'Something else',
		template: '',
	},
];

export default function ChipsStep( { value, onChange }: Props ) {
	const translate = useTranslate();
	const [ activeChip, setActiveChip ] = useState< string | null >( null );

	const handleChip = ( chip: Chip ) => {
		setActiveChip( chip.id );
		onChange( chip.template );
	};

	return (
		<VStack spacing={ 4 } className="home-wizard__step">
			<VStack spacing={ 1 }>
				<Heading level={ 2 } size={ 20 }>
					{ translate( 'What kind of site are you building?' ) }
				</Heading>
				<Text variant="muted">
					{ translate( 'Pick one to get started — you can fine-tune the description below.' ) }
				</Text>
			</VStack>

			<ul className="home-wizard__chip-grid" role="listbox">
				{ CHIPS.map( ( chip ) => {
					const isActive = activeChip === chip.id;
					return (
						<li key={ chip.id }>
							<button
								type="button"
								role="option"
								aria-selected={ isActive }
								className={ 'home-wizard__type-chip' + ( isActive ? ' is-selected' : '' ) }
								onClick={ () => handleChip( chip ) }
							>
								{ chip.label }
							</button>
						</li>
					);
				} ) }
			</ul>

			{ activeChip && (
				<TextareaControl
					__nextHasNoMarginBottom
					label={ translate( 'Edit to make it yours' ) as string }
					value={ value }
					onChange={ onChange }
					rows={ 3 }
					placeholder={ translate( 'Replace the [brackets] with your specifics.' ) as string }
				/>
			) }
		</VStack>
	);
}
