import { FormTokenField } from '@wordpress/components';
import { useEffect, useMemo, useRef } from 'react';
import type { TokenItem } from '@wordpress/components/build-types/form-token-field/types';

interface TokenSelectorProps {
	label: string;
	/** The selectable options: slug (stored value) → translated label (displayed). */
	options: Record< string, string >;
	/** The selected option slugs. */
	value: string[];
	onChange: ( slugs: string[] ) => void;
	/** Caps the selection at this many options and hides the suggestions once reached. */
	maxItems?: number;
	/** Offers the options A–Z. Set to false to keep the order they are declared in. */
	sortSuggestions?: boolean;
	help?: string;
}

/**
 * A token field that displays option labels while storing their slugs.
 * Only known options can be added.
 */
export default function TokenSelector( {
	label,
	options,
	value,
	onChange,
	maxItems,
	sortSuggestions = true,
	help = '',
}: TokenSelectorProps ) {
	const containerRef = useRef< HTMLDivElement >( null );

	// FormTokenField hardcodes autocomplete="off", which Chrome ignores.
	useEffect( () => {
		containerRef.current?.querySelector( 'input' )?.setAttribute( 'autocomplete', 'none' );
	}, [] );

	const slugsByLabel = useMemo(
		() =>
			Object.fromEntries( Object.entries( options ).map( ( [ slug, text ] ) => [ text, slug ] ) ),
		[ options ]
	);

	const selectedLabels = value.flatMap( ( slug ) =>
		options[ slug ] ? [ options[ slug ] ] : []
	);

	const onLabelsChange = ( tokens: ( string | TokenItem )[] ) => {
		const slugs = tokens.flatMap( ( token ) => {
			const slug = slugsByLabel[ typeof token === 'string' ? token : token.value ];
			return slug ? [ slug ] : [];
		} );

		onChange( maxItems === undefined ? slugs : slugs.slice( 0, maxItems ) );
	};

	let suggestions = Object.values( options );
	if ( maxItems !== undefined && value.length >= maxItems ) {
		suggestions = [];
	} else if ( sortSuggestions ) {
		suggestions.sort( ( a, b ) => a.localeCompare( b ) );
	}

	return (
		<div ref={ containerRef }>
			<FormTokenField
				__experimentalAutoSelectFirstMatch
				__experimentalExpandOnFocus
				__experimentalValidateInput={ ( token ) =>
					token in slugsByLabel && ( maxItems === undefined || value.length < maxItems )
				}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				help={ help }
				label={ label }
				onChange={ onLabelsChange }
				suggestions={ suggestions }
				value={ selectedLabels }
			/>
		</div>
	);
}
