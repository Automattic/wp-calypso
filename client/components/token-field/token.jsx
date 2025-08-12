import { Gridicon, Tooltip } from '@automattic/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

export default class extends PureComponent {
	static displayName = 'Token';

	static propTypes = {
		value: PropTypes.string.isRequired,
		displayTransform: PropTypes.func.isRequired,
		onClickRemove: PropTypes.func,
		status: PropTypes.oneOf( [ 'error', 'success', 'validating' ] ),
		isBorderless: PropTypes.bool,
		tooltip: PropTypes.string,
		disabled: PropTypes.bool,
	};

	static defaultProps = {
		onClickRemove: () => {},
		isBorderless: false,
		disabled: false,
	};

	render() {
		const { value, status, isBorderless, tooltip, displayTransform } = this.props;
		const tokenClasses = clsx( 'token-field__token', {
			'is-error': 'error' === status,
			'is-success': 'success' === status,
			'is-validating': 'validating' === status,
			'is-borderless': isBorderless,
			'is-disabled': this.props.disabled,
		} );

		/* translators: %(item)s is the selected item */
		const ariaLabel = translate( 'Deselect %(item)s', {
			args: {
				item: displayTransform( value ),
			},
		} );

		return (
			<button
				type="button"
				className={ tokenClasses }
				onMouseEnter={ this.props.onMouseEnter }
				onMouseLeave={ this.props.onMouseLeave }
				onClick={ ! this.props.disabled ? this._onClickRemove : null }
				tabIndex={ 0 }
				disabled={ this.props.disabled }
				aria-label={ ariaLabel }
			>
				<span className="token-field__token-text">{ displayTransform( value ) }</span>
				<Gridicon
					icon="cross-small"
					size={ 24 }
					className="token-field__remove-token"
					onClick={ ! this.props.disabled ? this._onClickRemove : null }
				/>
				{ tooltip && (
					<Tooltip showOnMobile context={ this } status={ status } isVisible position="bottom">
						{ tooltip }
					</Tooltip>
				) }
			</button>
		);
	}

	_onClickRemove = () => {
		this.props.onClickRemove( {
			value: this.props.value,
		} );
	};
}
