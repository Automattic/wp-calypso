import React, { PropTypes } from 'react';

import Button from 'components/button';
import Gridicon from 'components/gridicon';

export const PurchaseButton = React.createClass( {
	render() {
		const { isActive } = this.props;

		if ( isActive ) {
			return (
				<Button className="is-active-plugin" compact borderless>
					<Gridicon icon="checkmark" />{ this.translate( 'Active' ) }
				</Button>
			);
		}

		return <Button compact primary>{ this.translate( 'Purchase' ) }</Button>;
	}
} );

PurchaseButton.propTypes = {
	isActive: PropTypes.bool.isRequired
};

export default PurchaseButton;
