import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useRef } from 'react';
import type { AmplifyMode } from 'calypso/a8c-for-agencies/data/amplify/types';
import type { KeyboardEvent } from 'react';

const ICON_PERSON = (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
		<circle cx="12" cy="7" r="4" />
	</svg>
);

const ICON_SPARKLES = (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M12 3l1.9 5.4L19 11l-5.1 2.6L12 19l-1.9-5.4L5 11l5.1-2.6z" />
		<path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
	</svg>
);

const ICON_TARGET = (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="12" cy="12" r="10" />
		<circle cx="12" cy="12" r="6" />
		<circle cx="12" cy="12" r="2" />
	</svg>
);

type Option = {
	value: AmplifyMode;
	icon: JSX.Element;
	iconClass: string;
	title: string;
	description: string;
};

function options(): Option[] {
	return [
		{
			value: 'human',
			icon: ICON_PERSON,
			iconClass: 'is-human',
			title: __( 'Human-centric analysis' ),
			description: __( 'Score how a human audience reads and understands your site.' ),
		},
		{
			value: 'ai',
			icon: ICON_SPARKLES,
			iconClass: 'is-ai',
			title: __( 'AI analysis' ),
			description: __(
				'Score how AI tools like ChatGPT, Gemini, and Perplexity read and rank your site.'
			),
		},
		{
			value: 'full',
			icon: ICON_TARGET,
			iconClass: 'is-full',
			title: __( 'Full analysis' ),
			description: __( 'Run both lenses for a complete picture and prompt-ready findings.' ),
		},
	];
}

export default function AnalysisTypeCards( {
	value,
	onChange,
}: {
	value: AmplifyMode | null;
	onChange: ( mode: AmplifyMode ) => void;
} ) {
	const items = options();
	const buttonRefs = useRef< ( HTMLButtonElement | null )[] >( [] );

	// Roving tabindex: a single card is reachable via Tab. Fall back to the first
	// card when nothing is selected yet, per the ARIA radio group pattern.
	const selectedIndex = items.findIndex( ( option ) => option.value === value );
	const focusableIndex = selectedIndex === -1 ? 0 : selectedIndex;

	const moveSelection = ( fromIndex: number, delta: number ) => {
		const nextIndex = ( fromIndex + delta + items.length ) % items.length;
		onChange( items[ nextIndex ].value );
		buttonRefs.current[ nextIndex ]?.focus();
	};

	const handleKeyDown = ( event: KeyboardEvent< HTMLButtonElement >, index: number ) => {
		switch ( event.key ) {
			case 'ArrowDown':
			case 'ArrowRight':
				event.preventDefault();
				moveSelection( index, 1 );
				break;
			case 'ArrowUp':
			case 'ArrowLeft':
				event.preventDefault();
				moveSelection( index, -1 );
				break;
		}
	};

	return (
		<VStack spacing={ 3 }>
			<Text weight={ 500 }>{ __( 'Choose your analysis type' ) }</Text>
			<VStack spacing={ 2 } role="radiogroup" aria-label={ __( 'Analysis type' ) }>
				{ items.map( ( option, index ) => {
					const isSelected = value === option.value;
					return (
						<button
							key={ option.value }
							ref={ ( element ) => {
								buttonRefs.current[ index ] = element;
							} }
							type="button"
							role="radio"
							aria-checked={ isSelected }
							tabIndex={ index === focusableIndex ? 0 : -1 }
							className={ clsx( 'amplify-analysis-card', { 'is-selected': isSelected } ) }
							onClick={ () => onChange( option.value ) }
							onKeyDown={ ( event ) => handleKeyDown( event, index ) }
						>
							<HStack spacing={ 4 } alignment="center" justify="flex-start">
								<span
									className={ clsx( 'amplify-analysis-card__icon', option.iconClass ) }
									aria-hidden="true"
								>
									<Icon icon={ option.icon } size={ 20 } />
								</span>
								<VStack spacing={ 1 }>
									<Text weight={ 500 }>{ option.title }</Text>
									<Text variant="muted">{ option.description }</Text>
								</VStack>
							</HStack>
						</button>
					);
				} ) }
			</VStack>
		</VStack>
	);
}
