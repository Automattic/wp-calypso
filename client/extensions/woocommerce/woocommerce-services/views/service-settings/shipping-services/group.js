/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ShippingServiceEntry from './entry';
import FoldableCard from 'components/foldable-card';
import Checkbox from 'woocommerce/woocommerce-services/components/checkbox';
import InfoTooltip from 'woocommerce/woocommerce-services/components/info-tooltip';

const summaryLabel = ( services, numSelected, translate ) => {
	if ( numSelected === services.length ) {
		return translate( 'All services selected' );
	}
	return translate(
		'%(numSelected)d service selected',
		'%(numSelected)d services selected',
		{
			count: numSelected,
			args: { numSelected },
		}
	);
};

const updateAll = ( event, updateValue, services ) => {
	services.forEach( ( service ) => {
		updateValue( [ service.id, 'enabled' ], event.target.checked );
	} );
};

const ShippingServiceGroup = ( props ) => {
	const {
		title,
		deliveryEstimate,
		services,
		updateValue,
		errors,
		translate,
	} = props;

	const numSelected = services.reduce( ( count, service ) => (
		count + ( service.enabled ? 1 : 0 )
	), 0 );

	const stopPropagation = ( event ) => event.stopPropagation();
	const onChange = ( event ) => updateAll( event, updateValue, services );

	const renderHeader = () => {
		return <div>
			<Checkbox
				checked={ services.length === numSelected }
				partialChecked={ Boolean( numSelected ) }
				onChange={ onChange }
				onClick={ stopPropagation } />
			{ title }
			{ deliveryEstimate && (
				<small className="shipping-services__delivery-estimate">
					({ deliveryEstimate })
				</small>
			) }
		</div>;
	};

	const summary = summaryLabel( services, numSelected, translate );

	return (
		<div className={ classNames( { 'is-error': ! isEmpty( errors ) } ) }>
			<FoldableCard
				header={ renderHeader() }
				summary={ summary }
				expandedSummary={ summary }
				clickableHeader={ true }
				compact
				screenReaderText={ translate( 'Expand Services' ) }
			>
				<div className="shipping-services__entry shipping-services__entry-header-container">
					<span className="shipping-services__entry-header">{ translate( 'Service' ) }</span>
					<span className="shipping-services__entry-header shipping-services__entry-price-adjustment">
						{ translate( 'Price adjustment' ) }
						<InfoTooltip
							className="shipping-services__entry-price-adjustment-info"
							position="top left"
							maxWidth={ 230 }>
							{ translate( 'Increase the rates calculated by the carrier to account for packaging and handling costs. ' +
								'You can also add a negative amount to save your customers money.' ) }
						</InfoTooltip>
					</span>
				</div>

				{ services.map( ( service, idx ) => {
					const onUpdate = ( key, val ) => updateValue( [ service.id ].concat( key ), val );
					return <ShippingServiceEntry
							{ ...props }
							{ ...{ service } }
							updateValue={ onUpdate }
							key={ idx }
						/>;
				} ) }
			</FoldableCard>
		</div>
	);
};

ShippingServiceGroup.propTypes = {
	title: PropTypes.string.isRequired,
	deliveryEstimate: PropTypes.string,
	services: PropTypes.arrayOf( PropTypes.shape( {
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		enabled: PropTypes.bool,
		adjustment: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.number,
		] ),
		adjustment_type: PropTypes.string,
	} ) ).isRequired,
	updateValue: PropTypes.func.isRequired,
};

export default localize( ShippingServiceGroup );
