import { SearchControl } from '@wordpress/components';
import {
	useState,
	useEffect,
	useRef,
	forwardRef,
	useImperativeHandle,
	Ref,
	useMemo,
} from '@wordpress/element';
import { _x } from '@wordpress/i18n';
import clsx from 'clsx';
import { debounce } from 'lodash';
import './style.scss';

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

interface DomainSearchControlProps {
	className?: string;
	autoFocus?: boolean;
	delaySearch?: boolean;
	delayTimeout?: number;
	describedBy?: string;
	dir?: string;
	defaultValue?: string;
	value?: string;
	inputLabel?: string;
	minLength?: number;
	maxLength?: number;
	onBlur?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	onSearch?: ( value: string ) => void;
	onSearchChange?: ( value: string ) => void;
	isOnboarding?: boolean;
}

const DomainSearchControl = forwardRef( function DomainSearchControl(
	{
		className,
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
		onBlur,
		onSearch,
		onSearchChange,
		isOnboarding,
	}: DomainSearchControlProps,
	ref: Ref< HTMLInputElement >
) {
	const [ , setValue ] = useState( defaultValue || controlledValue || '' );
	const inputRef = useRef< HTMLInputElement >( null );
	useImperativeHandle( ref, () => inputRef.current as HTMLInputElement );

	useEffect( () => {
		onSearchChange?.( controlledValue ?? '' );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ controlledValue ] );

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

	const containerClassName = clsx( 'domain-search-control', className, {
		'is-onboarding': isOnboarding,
	} );

	const searchControlLabel = inputLabel || _x( 'Search', 'search label', 'domain-search' );

	return (
		<div className={ containerClassName }>
			<SearchControl
				__nextHasNoMarginBottom
				className="domain-search-control__search-input"
				label={ searchControlLabel }
				hideLabelFromVision
				value={ controlledValue }
				onChange={ handleChange }
				onReset={ handleReset }
				// eslint-disable-next-line jsx-a11y/no-autofocus
				autoFocus={ autoFocus }
				onBlur={ onBlur }
				minLength={ minLength }
				maxLength={ maxLength }
				ref={ inputRef }
				dir={ dir }
				aria-describedby={ describedBy }
			/>
		</div>
	);
} );

export default DomainSearchControl;
