/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';

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
		</div>;
	};

	const summary = summaryLabel( services, numSelected, translate );

	return (
		<FoldableCard
			header={ renderHeader() }
			summary={ summary }
			expandedSummary={ summary }
			clickableHeader={ true }
			compact
			screenReaderText={ __( 'Expand Services' ) }
			expanded={ ! isEmpty( errors ) }
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
	);
};

ShippingServiceGroup.propTypes = {
	title: PropTypes.string.isRequired,
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
