/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormTextInput from 'components/forms/form-text-input';
import { getCurrentlyEditingShippingZone } from 'woocommerce/state/ui/shipping/zones/selectors';
import { changeShippingZoneName } from 'woocommerce/state/ui/shipping/zones/actions';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';

class ShippingZoneName extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			editing: false,
		};
	}

	render() {
		const { loaded, zone, actions, onChange } = this.props;
		const { editing } = this.state;

		const startEditing = () => ( this.setState( { editing: true } ) );
		const stopEditing = () => ( this.setState( { editing: false } ) );
		const onNameChange = ( event ) => {
			onChange();
			actions.changeShippingZoneName( event.target.value );
		};

		const renderContent = () => {
			if ( ! loaded ) {
				return (
					<div className="shipping-zone__name is-placeholder">
						<span />
						<Button borderless>
							<Gridicon icon="pencil" size={ 24 } />
						</Button>
					</div>
				);
			}

			if ( editing ) {
				return (
					<div className="shipping-zone__name">
						<FormTextInput value={ zone.name } onChange={ onNameChange } />
						<Button borderless onClick={ stopEditing }>
							<Gridicon icon="checkmark" size={ 24 } />
						</Button>
					</div>
				);
			}

			return (
				<div className="shipping-zone__name">
					<span>{ zone.name }</span>
					<Button borderless onClick={ startEditing }>
						<Gridicon icon="pencil" size={ 24 } />
					</Button>
				</div>
			);
		};

		return (
			<Card className="shipping-zone__name-container">
				{ renderContent() }
			</Card>
		);
	}
}

ShippingZoneName.PropTypes = {
	siteId: PropTypes.number,
	loaded: PropTypes.bool.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default connect(
	( state ) => ( {
		zone: getCurrentlyEditingShippingZone( state ),
	} ),
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId( {
			changeShippingZoneName,
		}, dispatch, ownProps.siteId ),
	} )
)( localize( ShippingZoneName ) );
