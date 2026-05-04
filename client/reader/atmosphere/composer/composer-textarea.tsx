import { useEffect, useRef } from 'react';

// Keep in sync with `min-height` on `.atmosphere-composer__textarea` in
// `style.scss`. Inline `style.height` set by the autogrow effect would
// otherwise win over the stylesheet for empty / single-line content.
const MIN_HEIGHT_PX = 80;

interface Props {
	value: string;
	onChange: ( value: string ) => void;
	onSubmit: () => void;
	placeholder: string;
	disabled?: boolean;
	'aria-label'?: string;
	'aria-describedby'?: string;
	'aria-invalid'?: boolean;
}

export function ComposerTextarea( {
	value,
	onChange,
	onSubmit,
	placeholder,
	disabled,
	'aria-label': ariaLabel,
	'aria-describedby': ariaDescribedBy,
	'aria-invalid': ariaInvalid,
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
		el.style.height = `${ Math.max( el.scrollHeight, MIN_HEIGHT_PX ) }px`;
	}, [ value ] );

	return (
		<textarea
			ref={ ref }
			className="atmosphere-composer__textarea"
			value={ value }
			placeholder={ placeholder }
			disabled={ disabled }
			aria-label={ ariaLabel }
			aria-describedby={ ariaDescribedBy }
			aria-invalid={ ariaInvalid }
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
