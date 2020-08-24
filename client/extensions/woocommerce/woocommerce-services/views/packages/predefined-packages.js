/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import BulkSelect from 'woocommerce/components/bulk-select';
import FoldableCard from 'components/foldable-card';
import FormCheckbox from 'components/forms/form-checkbox';
import PackagesListItem from './packages-list-item';
import { getCurrentlyEditingPredefinedPackages } from '../../state/packages/selectors';

const PredefinedPackages = ( {
	siteId,
	form,
	toggleAll,
	togglePackage,
	currentlyEditingPredefinedPackages,
	translate,
} ) => {
	const { dimensionUnit } = form;

	const renderGroupHeader = ( group ) => {
		const onToggle = ( state, event ) => {
			event.stopPropagation();
			toggleAll( siteId, group.serviceId, group.groupId, event.target.checked );
		};
		const inputId = `group-${ group.serviceId }-${ group.groupId }`;

		// The onClick handler only exists to prevent the input click event from bubbling up to FoldableCard
		// This does not affect the keyboard accessibility.
		/* eslint-disable jsx-a11y/click-events-have-key-events */
		/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
		return (
			<div className="packages__group-header">
				<label htmlFor={ inputId } onClick={ ( event ) => event.stopPropagation() }>
					<BulkSelect
						id={ inputId }
						totalElements={ group.total }
						selectedElements={ group.selected }
						onToggle={ onToggle }
						className="packages__group-header-checkbox"
					/>
					{ group.title }
				</label>
			</div>
		);
		/* eslint-enable jsx-a11y/click-events-have-key-events */
		/* eslint-enable jsx-a11y/no-static-element-interactions */
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

			return (
				<PackagesListItem
					key={ index }
					siteId={ siteId }
					data={ pckg }
					dimensionUnit={ dimensionUnit }
					prefixActions
				>
					<FormCheckbox checked={ pckg.selected } onChange={ onToggle } />
				</PackagesListItem>
			);
		} );
	};

	const renderContent = () => {
		const elements = [];

		forEach( currentlyEditingPredefinedPackages, ( group, groupId ) => {
			const summary = getSelectionSummary( group.selected, group.total );

			elements.push(
				<FoldableCard
					className="packages__predefined-packages"
					key={ groupId }
					header={ renderGroupHeader( group ) }
					summary={ summary }
					expandedSummary={ summary }
					clickableHeader={ true }
					expanded={ false }
					screenReaderText={ translate( 'Expand Services' ) }
					icon="chevron-down"
				>
					{ renderServicePackages( group ) }
				</FoldableCard>
			);
		} );

		return elements;
	};

	return <div>{ renderContent() }</div>;
};

PredefinedPackages.propTypes = {
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
