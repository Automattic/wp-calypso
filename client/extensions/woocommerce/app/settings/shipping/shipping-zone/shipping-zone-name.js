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
import { decodeEntities } from 'lib/formatting';
import { changeShippingZoneName } from 'woocommerce/state/ui/shipping/zones/actions';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';

export const getZoneName = ( zone, locations, translate, returnEmpty = false ) => {
	if ( zone.name ) {
		return zone.name;
	}

	if ( returnEmpty ) {
		return '';
	}

	if ( ! locations || ! locations.length ) {
		return translate( 'Empty zone' );
	}

	const locationNames = locations.map( ( { name, postcodeFilter } ) => (
		postcodeFilter ? postcodeFilter : decodeEntities( name )
	) );

	if ( locationNames.length > 10 ) {
		const remaining = locationNames.length - 10;
		const listed = locationNames.slice( 0, 10 );
		return ( translate(
			'%(locationList)s and %(count)s other region',
			'%(locationList)s and %(count)s other regions',
			{
				count: remaining,
				args: {
					locationList: listed.join( ', ' ),
					count: remaining,
				}
			}
		) );
	}

	return locationNames.join( ', ' );
};

class ShippingZoneName extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			editing: false,
		};
	}

	render() {
		const { loaded, isRestOfTheWorld, zone, locations, actions, onChange, translate } = this.props;
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
						<FormTextInput
							value={ getZoneName( zone, locations, translate, true ) }
							onChange={ onNameChange }
							placeholder={ translate( 'Enter a new zone name or leave empty to automatically list locations' ) } />
						<Button borderless onClick={ stopEditing }>
							<Gridicon icon="checkmark" size={ 24 } />
						</Button>
					</div>
				);
			}

			return (
				<div className="shipping-zone__name">
					<span>{ getZoneName( zone, locations, translate ) }</span>
					{ isRestOfTheWorld
						? null
						: <Button borderless onClick={ startEditing }><Gridicon icon="pencil" size={ 24 } /></Button> }
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
	isRestOfTheWorld: PropTypes.bool.isRequired,
	loaded: PropTypes.bool.isRequired,
	onChange: PropTypes.func.isRequired,
	zone: PropTypes.object,
	locations: PropTypes.array,
};

export default connect(
	null,
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId( {
			changeShippingZoneName,
		}, dispatch, ownProps.siteId ),
	} )
)( localize( ShippingZoneName ) );
