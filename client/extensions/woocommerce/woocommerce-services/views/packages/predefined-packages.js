/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { forEach } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCurrentlyEditingPredefinedPackages } from '../../state/packages/selectors';
import PackagesListItem from './packages-list-item';
import FoldableCard from 'components/foldable-card';
import FormCheckbox from 'components/forms/form-checkbox';
import BulkSelect from 'woocommerce/components/bulk-select';

const PredefinedPackages = ( { siteId, form, toggleAll, togglePackage, currentlyEditingPredefinedPackages, translate } ) => {
	const { dimensionUnit } = form;

	const renderGroupHeader = ( group ) => {
		const onToggle = ( state, event ) => {
			event.stopPropagation();
			toggleAll( siteId, group.serviceId, group.groupId, event.target.checked );
		};

		return (
			<div className="packages__group-header" >
				<BulkSelect
					totalElements={ group.total }
					selectedElements={ group.selected }
					onToggle={ onToggle }
					className="packages__group-header-checkbox" />
				{ group.title }
			</div>
		);
	};

	const getSelectionSummary = ( selectedCount, totalCount ) => {
		if ( selectedCount === totalCount ) {
			return translate( 'All packages selected' );
		}

		return translate( '%(selectedCount)d package selected', '%(selectedCount)d packages selected', {
			count: selectedCount,
			args: { selectedCount },
		} );
	};

	const renderServicePackages = ( group ) => {
		return group.packages.map( ( pckg, index ) => {
			const onToggle = () => togglePackage( siteId, pckg.serviceId, pckg.id );

			return ( <PackagesListItem
				key={ index }
				siteId={ siteId }
				data={ pckg }
				dimensionUnit={ dimensionUnit }
				prefixActions >
				<FormCheckbox checked={ pckg.selected } onChange={ onToggle } />
			</PackagesListItem> );
		} );
	};

	const renderContent = () => {
		const elements = [];

		forEach( currentlyEditingPredefinedPackages, ( group, groupId ) => {
			const summary = getSelectionSummary( group.selected, group.total );

			elements.push( <FoldableCard
				className="packages__predefined-packages"
				key={ groupId }
				header={ renderGroupHeader( group ) }
				summary={ summary }
				expandedSummary={ summary }
				clickableHeader={ true }
				expanded={ false }
				screenReaderText={ translate( 'Expand Services' ) }
				icon="chevron-down" >
				{ renderServicePackages( group ) }
			</FoldableCard> );
		} );

		return elements;
	};

	return (
		<div>
			{ renderContent() }
		</div>
	);
};

PredefinedPackages.PropTypes = {
	siteId: PropTypes.number.isRequired,
	toggleAll: PropTypes.func.isRequired,
	togglePackage: PropTypes.func.isRequired,
	form: PropTypes.shape( {
		dimensionUnit: PropTypes.string,
	} ).isRequired,
};

export default connect( ( state ) => ( {
	currentlyEditingPredefinedPackages: getCurrentlyEditingPredefinedPackages( state ),
} ) )( localize( PredefinedPackages ) );
