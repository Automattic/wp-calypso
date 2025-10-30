import { Button, VisuallyHidden } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import clsx from 'clsx';
import { MouseEventHandler } from 'react';

interface TokenItem {
	/**
	 *  The value of the token.
	 */
	value: string;
	/**
	 * One of 'error', 'validating', or 'success'. Applies styles to token.
	 */
	status?: 'error' | 'success' | 'validating';
	/**
	 * If not falsey, will add a title to the token.
	 */
	title?: string;
	/**
	 * When true, renders tokens as without a background.
	 */
	isBorderless?: boolean;
	/**
	 * Function to call when onMouseEnter event triggered on token.
	 */
	onMouseEnter?: MouseEventHandler< HTMLSpanElement >;
	/**
	 *  Function to call when onMouseLeave is triggered on token.
	 */
	onMouseLeave?: MouseEventHandler< HTMLSpanElement >;
}

type Messages = {
	/**
	 * The user added a new token.
	 */
	added: string;
	/**
	 * The user removed an existing token.
	 */
	removed: string;
	/**
	 * The user focused the button to remove the token.
	 */
	remove: string;
	/**
	 * The user tried to add a token that didn't pass the validation.
	 */
	__experimentalInvalid: string;
};

interface TokenProps extends TokenItem {
	displayTransform: ( value: string ) => string;
	disabled: boolean;
	onClickRemove: ( { value }: { value: string } ) => void;
	messages: Messages;
	termPosition: number;
	termsCount: number;
}

const noop = () => {};

export default function Token( {
	value,
	status,
	title,
	displayTransform,
	isBorderless = false,
	disabled = false,
	onClickRemove = noop,
	onMouseEnter,
	onMouseLeave,
	messages,
	termPosition,
	termsCount,
}: TokenProps ) {
	const instanceId = useInstanceId( Token );
	const tokenClasses = clsx( 'components-form-token-field__token', {
		'is-error': 'error' === status,
		'is-success': 'success' === status,
		'is-validating': 'validating' === status,
		'is-borderless': isBorderless,
		'is-disabled': disabled,
	} );

	const onClick = () => onClickRemove( { value } );

	const transformedValue = displayTransform( value );
	const termPositionAndCount = sprintf(
		/* translators: 1: term name, 2: term position in a set of terms, 3: total term set count. */
		__( '%1$s (%2$d of %3$d)' ),
		transformedValue,
		termPosition,
		termsCount
	);

	return (
		<span
			className={ tokenClasses }
			onMouseEnter={ onMouseEnter }
			onMouseLeave={ onMouseLeave }
			title={ title }
		>
			<span
				className="components-form-token-field__token-text"
				id={ `components-form-token-field__token-text-${ instanceId }` }
			>
				<VisuallyHidden as="span">{ termPositionAndCount }</VisuallyHidden>
				<span aria-hidden="true">{ transformedValue }</span>
			</span>

			<Button
				className="components-form-token-field__remove-token"
				size="small"
				icon={ closeSmall }
				onClick={ ! disabled ? onClick : undefined }
				// Disable reason: Even when FormTokenField itself is accessibly disabled, token reset buttons shouldn't be in the tab sequence.
				// eslint-disable-next-line no-restricted-syntax
				disabled={ disabled }
				label={ messages.remove }
				aria-describedby={ `components-form-token-field__token-text-${ instanceId }` }
			/>
		</span>
	);
}
