import React, { PropTypes } from 'react';

import Button from 'components/button';
import Gridicon from 'components/gridicon';


export default React.createClass( {
	displayName: 'ComparisonTableHeader',

	propTypes: {
		name: PropTypes.string,
		description: PropTypes.string,
		price: PropTypes.number,
		currentPlan: PropTypes.bool,
		popular: PropTypes.bool,
		currency: PropTypes.string
	},

	getDefaultProps() {
		return {
			name: '',
			description: '',
			price: null,
			currentPlan: false,
			popular: false,
			currency: '$'
		};
	},

	tableHeader() {
		return (
			<div className="comparison-table__header-wrapper">
				<h2>{ this.props.name }</h2>
				<p>{ this.props.description }</p>
				<span className="table-header__currency">{ this.props.currency }</span>
				<span className="table-header__price">{ this.props.price }</span>
				<span className="table-header__frequency">{ this.translate( '/mo' ) }</span>
				<Button primary={ ! this.props.currentPlan }>{ this.buttonLabel() }</Button>
			</div>
		);
	},

	buttonLabel() {
		if( this.props.currentPlan ) {
			return <div><Gridicon icon="checkmark" />{ this.translate( 'Your Plan' ) }</div>
		}

		return this.translate( 'Upgrade' );
	},

	render() {
		return (
			<div className="comparison-table__header">
				{ this.props.children
					? this.props.children
					: this.tableHeader()}
			</div>
		)
	}
} );
