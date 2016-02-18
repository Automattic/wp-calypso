/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import times from 'lodash/times';

/**
 * Internal dependencies
 */
import PurchaseItem from '../item';
import SectionHeader from 'components/section-header';

const PurchasesSite = React.createClass( {
	propTypes: {
		slug: React.PropTypes.string,
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
				<SectionHeader label={ isPlaceholder ? this.translate( 'Loading…' ) : this.props.name }>
					<span className="purchases-site__slug">{ this.props.slug }</span>
				</SectionHeader>
				{
					isPlaceholder ?
					this.placeholders() :
					this.props.purchases.map( purchase => (
						<PurchaseItem
							key={ purchase.id }
							slug={ this.props.slug }
							purchase={ purchase } />
						)
					)
				}
			</div>
		);
	}
} );

export default PurchasesSite;
