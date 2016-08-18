/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';
import Spinner from 'components/spinner';

export default React.createClass( {
	displayName: 'SpinnerButton',

	propTypes: {
		disabled: PropTypes.bool,
		loading: PropTypes.bool,

		text: PropTypes.string,
		loadingText: PropTypes.string,
		size: PropTypes.number
	},

	getDefaultProps() {
		return {
			size: 24,
			loading: false
		};
	},

	render() {
		const { loading, text, loadingText, size, disabled } = this.props;

		// Pass any extra props down to the Button component, leaving out
		// any SpinnerButton specific props
		const buttonProps = omit( this.props, [
			'loading',
			'loadingText',
			'text',
			'size',
			'disabled'
		] );

		return (
			<div>
				<Button disabled={ loading || disabled } { ...buttonProps }>
					{ loading ? loadingText : text }
				</Button>

				{ loading &&
					<Spinner
						size={ size }
						className="export-card__spinner-button" />
				}
			</div>
		);
	}
} );
