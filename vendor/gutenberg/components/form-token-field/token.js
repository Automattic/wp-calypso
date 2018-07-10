/**
 * External dependencies
 */
import classnames from 'classnames';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import withInstanceId from '../higher-order/with-instance-id';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import IconButton from '../icon-button';

function Token( {
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
	instanceId,
} ) {
	const tokenClasses = classnames( 'components-form-token-field__token', {
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
		__( '%1$s (%2$s of %3$s)' ),
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
				<span className="screen-reader-text">{ termPositionAndCount }</span>
				<span aria-hidden="true">{ transformedValue }</span>
			</span>

			<IconButton
				className="components-form-token-field__remove-token"
				icon="dismiss"
				onClick={ ! disabled && onClick }
				label={ messages.remove }
				aria-describedby={ `components-form-token-field__token-text-${ instanceId }` }
			/>
		</span>
	);
}

export default withInstanceId( Token );
