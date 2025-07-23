import { DomainSearchControls, useTypedPlaceholder } from '@automattic/domain-search';
import { useState, useEffect, useRef, useMemo } from '@wordpress/element';
import { _x } from '@wordpress/i18n';
import { debounce } from 'lodash';

const useUpdateEffect = ( effect: () => void, deps: React.DependencyList ) => {
	const isInitialMount = useRef( true );

	useEffect( () => {
		if ( isInitialMount.current ) {
			isInitialMount.current = false;
		} else {
			effect();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps );
};

interface DomainSearchInputProps {
	autoFocus?: boolean;
	delaySearch?: boolean;
	delayTimeout?: number;
	describedBy?: string;
	dir?: 'ltr' | 'rtl';
	defaultValue?: string;
	value?: string;
	inputLabel?: string;
	minLength?: number;
	maxLength?: number;
	placeholderAnimation?: boolean;
	onBlur?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	onSearch?: ( value: string ) => void;
	onSearchChange?: ( value: string ) => void;
}

const PLACEHOLDER_PHRASES = [
	'dailywine.blog',
	'creatortools.shop',
	'literatiagency.com',
	'democratizework.org',
	'discardedobject.art',
];

const DomainSearchInput = function DomainSearchInput( {
	autoFocus,
	delaySearch,
	delayTimeout = 300,
	describedBy,
	dir,
	defaultValue,
	value: controlledValue,
	inputLabel,
	minLength,
	maxLength,
	placeholderAnimation,
	onBlur = () => {},
	onSearch,
	onSearchChange,
}: DomainSearchInputProps ) {
	const [ , setValue ] = useState( defaultValue || controlledValue || '' );

	// We want to pause the placeholder animation
	// if the placeholder animation is disabled or if the input is not empty
	const pausePlaceholderAnimation = ! placeholderAnimation || !! controlledValue;
	const { placeholder } = useTypedPlaceholder( PLACEHOLDER_PHRASES, pausePlaceholderAnimation );

	const doSearch = useMemo( () => {
		if ( ! onSearch ) {
			return;
		}
		if ( ! delaySearch ) {
			return onSearch;
		}
		return debounce( onSearch, delayTimeout );
	}, [ onSearch, delayTimeout, delaySearch ] );

	useUpdateEffect( () => {
		if ( doSearch ) {
			if ( controlledValue ) {
				doSearch( controlledValue );
			} else {
				if ( delaySearch ) {
					( doSearch as ReturnType< typeof debounce > ).cancel();
				}
				onSearch?.( controlledValue ?? '' );
			}
		}
	}, [ controlledValue ] );

	const handleChange = ( newValue: string ) => {
		onSearchChange?.( newValue );
		setValue( newValue );
	};

	const handleReset = () => {
		handleChange( '' );
	};

	const searchControlLabel = inputLabel || _x( 'Search', 'search label', 'domain-search' );

	return (
		<DomainSearchControls.Input
			label={ searchControlLabel }
			value={ controlledValue ?? '' }
			placeholder={ placeholderAnimation ? placeholder : undefined }
			onChange={ handleChange }
			onReset={ handleReset }
			// eslint-disable-next-line jsx-a11y/no-autofocus
			autoFocus={ autoFocus ?? false }
			onBlur={ onBlur }
			minLength={ minLength ?? 1 }
			maxLength={ maxLength ?? 253 }
			dir={ dir ?? 'ltr' }
			aria-describedby={ describedBy ?? '' }
		/>
	);
};

export { DomainSearchInput };
