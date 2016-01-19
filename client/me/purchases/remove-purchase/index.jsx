/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Dialog from 'components/dialog';
import { isDataLoading } from '../utils';

const RemovePurchase = React.createClass( {
	propTypes: {
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	getInitialState() {
		return {
			isDialogOpen: false
		};
	},

	render() {
		if ( isDataLoading( this.props ) ) {
			return null;
		}

		return (
			<CompactCard href="#">Remove Purchase</CompactCard>
		);
	}
} );

export default RemovePurchase;
