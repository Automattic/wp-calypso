/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import times from 'lodash/utility/times';

/**
 * Internal dependencies
 */
import PurchaseItem from '../item';

const PurchasesSite = React.createClass( {
	propTypes: {
		domain: React.PropTypes.string,
		name: React.PropTypes.string,
		purchases: React.PropTypes.array,
		isPlaceholder: React.PropTypes.bool
	},

	placeholders() {
		return times( 2, index => <PurchaseItem isPlaceholder key={ index } /> );
	},

	render() {
		const { isPlaceholder } = this.props,
			classes = classNames( 'purchases-site', { 'is-placeholder': isPlaceholder } );

		return (
			<div className={ classes }>
				<div className="purchases-site__header">
					<div className="purchases-site__header-text">
						{ isPlaceholder ? this.translate( 'Loading…' ) : this.props.name }
					</div>
				</div>
				{
					isPlaceholder ?
					this.placeholders() :
					this.props.purchases.map( purchase => (
						<PurchaseItem
							key={ purchase.id }
							domain={ this.props.domain }
							purchase={ purchase } />
						)
					)
				}
			</div>
		);
	}
} );

export default PurchasesSite;
