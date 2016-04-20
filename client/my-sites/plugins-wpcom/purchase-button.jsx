import React, { PropTypes } from 'react';

import Button from 'components/button';
import Gridicon from 'components/gridicon';
import page from 'page';

export const PurchaseButton = React.createClass( {
	showPlansPage() {
		const { slug } = this.props;
		page( `/plans/${ slug }` );
	},

	render() {
		const { isActive } = this.props;

		if ( isActive ) {
			return (
				<Button className="is-active-plugin" compact borderless>
					<Gridicon icon="checkmark" />{ this.translate( 'Active' ) }
				</Button>
			);
		}

		return <Button compact primary onClick={ this.showPlansPage }>{ this.translate( 'Purchase' ) }</Button>;
	}
} );

PurchaseButton.propTypes = {
	isActive: PropTypes.bool.isRequired
};

export default PurchaseButton;
