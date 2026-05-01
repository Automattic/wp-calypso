import { useEffect, useRef } from 'react';

interface Props {
	value: string;
	onChange: ( value: string ) => void;
	onSubmit: () => void;
	placeholder: string;
	disabled?: boolean;
	'aria-describedby'?: string;
}

export function ComposerTextarea( {
	value,
	onChange,
	onSubmit,
	placeholder,
	disabled,
	'aria-describedby': ariaDescribedBy,
}: Props ) {
	const ref = useRef< HTMLTextAreaElement | null >( null );

	useEffect( () => {
		ref.current?.focus();
	}, [] );

	useEffect( () => {
		const el = ref.current;
		if ( ! el ) {
			return;
		}
		el.style.height = 'auto';
		el.style.height = `${ el.scrollHeight }px`;
	}, [ value ] );

	return (
		<textarea
			ref={ ref }
			className="atmosphere-composer__textarea"
			value={ value }
			placeholder={ placeholder }
			disabled={ disabled }
			aria-describedby={ ariaDescribedBy }
			onChange={ ( e ) => onChange( e.target.value ) }
			onKeyDown={ ( e ) => {
				if ( e.key === 'Enter' && ( e.metaKey || e.ctrlKey ) ) {
					e.preventDefault();
					onSubmit();
				}
			} }
		/>
	);
}
