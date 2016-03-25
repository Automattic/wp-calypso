/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';

export default React.createClass( {
	propTypes: {
		isPageOnFront: React.PropTypes.bool,
		pageOnFrontId: React.PropTypes.number,
		blogOnFrontId: React.PropTypes.number,
		onChange: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			isPageOnFront: false,
			onChange: noop,
		};
	},

	getInitialState() {
		return {
			isPageOnFront: this.props.isPageOnFront,
		};
	},

	handleChange( event ) {
		const isPageOnFront = event.target.value === 'page';
		this.setState( { isPageOnFront } );
		this.props.onChange( { isPageOnFront } );
	},

	render() {
		return (
			<Card compact className="home-page-settings">
				<FormFieldset>
					<FormLegend>{ this.translate( 'Front page displays' ) }</FormLegend>
					<FormLabel>
						<FormRadio value="blog" checked={ ! this.state.isPageOnFront } onChange={ this.handleChange } />
						<span>{ this.translate( 'Your latest posts' ) }</span>
					</FormLabel>

					<FormLabel>
						<FormRadio value="page" checked={ this.state.isPageOnFront } onChange={ this.handleChange } />
						<span>{ this.translate( 'A static page' ) }</span>
					</FormLabel>
				</FormFieldset>
			</Card>
		);
	}
} );
