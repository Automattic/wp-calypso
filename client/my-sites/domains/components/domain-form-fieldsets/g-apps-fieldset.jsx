/**
 * External dependencies
 *
 * @format
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import identity from 'lodash/identity';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import { Input } from 'my-sites/domains/components/form';

export class GAppsFields extends Component {
	static propTypes = {
		getFieldProps: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		getFieldProps: noop,
		translate: identity,
	};

	render() {
		const { getFieldProps, translate } = this.props;
		return (
			<div className="domain-form-fieldsets__address-fields g-apps-fields">
				<div>
					<Input
						autoFocus
						label={ this.props.translate( 'First Name' ) }
						{ ...this.getFieldProps( 'first-name', true ) }
					/>

					<Input
						label={ this.props.translate( 'Last Name' ) }
						{ ...this.getFieldProps( 'last-name', true ) }
					/>
				</div>
				<Input label={ translate( 'Postal Code' ) } { ...getFieldProps( 'postal-code', true ) } />
			</div>
		);
	}
}

export default GAppsFields;
