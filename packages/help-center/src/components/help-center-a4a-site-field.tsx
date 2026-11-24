import { ComboboxControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useA4AAgencySites } from '../data/use-a4a-agency-sites';

type Props = {
	agencyId: number | undefined;
	label: string;
	placeholder?: string;
	value: string;
	onChange: ( value: string ) => void;
};

export const HelpCenterA4ASiteField = ( {
	agencyId,
	label,
	placeholder,
	value,
	onChange,
}: Props ) => {
	const [ inputValue, setInputValue ] = useState( '' );
	const [ search ] = useDebounce( inputValue.trim(), 300 );
	const { data: sites = [], isFetching } = useA4AAgencySites( agencyId, search );

	const options = useMemo( () => {
		const siteOptions = sites.map( ( site ) => ( {
			value: site.url,
			label: site.blogname ? `${ site.blogname } (${ site.url })` : site.url,
		} ) );
		const typedValue = inputValue.trim();
		const extraOptions: { value: string; label: string }[] = [];

		if ( typedValue && ! siteOptions.some( ( option ) => option.value === typedValue ) ) {
			extraOptions.push( {
				value: typedValue,
				/* translators: %s is the site address the user typed */
				label: sprintf( __( 'Use “%s”', __i18n_text_domain__ ), typedValue ),
			} );
		}

		if (
			value &&
			value !== typedValue &&
			! siteOptions.some( ( option ) => option.value === value )
		) {
			extraOptions.push( { value, label: value } );
		}

		return [ ...siteOptions, ...extraOptions ];
	}, [ sites, inputValue, value ] );

	return (
		<ComboboxControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={ label }
			placeholder={ placeholder }
			value={ value || null }
			options={ options }
			isLoading={ isFetching }
			onFilterValueChange={ setInputValue }
			onChange={ ( nextValue ) => onChange( nextValue ?? '' ) }
		/>
	);
};
