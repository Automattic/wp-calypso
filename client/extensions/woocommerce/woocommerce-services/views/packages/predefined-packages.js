/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { difference, filter, forEach, reject, some } from 'lodash';

/**
 * Internal dependencies
 */
import BulkSelect from 'woocommerce/components/bulk-select';
import FoldableCard from 'components/foldable-card';
import PackagesList from './packages-list';

const PredefinedPackages = ( props ) => {
	const renderPredefHeader = ( title, selected, packages, serviceId, groupId ) => {
		if ( ! selected ) {
			return null;
		}

		const onToggle = ( state, event ) => {
			event.stopPropagation();
			props.toggleAll( props.siteId, serviceId, groupId, event.target.checked );
		};

		return (
			<div className="packages__group-header" >
				<BulkSelect
					totalElements={ packages.length }
					selectedElements={ selected.length }
					onToggle={ onToggle }
					className="packages__group-header-checkbox" />
				{ title }
			</div>
		);
	};

	const predefSummary = ( serviceSelected, groupDefinitions ) => {
		const groupPackageIds = groupDefinitions.map( ( def ) => def.id );
		const diffLen = difference( groupPackageIds, serviceSelected ).length;
		const { translate } = props;

		if ( 0 >= diffLen ) {
			return translate( 'All packages selected' );
		}

		const selectedCount = groupPackageIds.length - diffLen;
		return translate( '%(selectedCount)d package selected', '%(selectedCount)d packages selected', {
			count: selectedCount,
			args: { selectedCount },
		} );
	};

	const renderPredefinedPackages = () => {
		const elements = [];
		const { siteId, translate, form } = props;
		const {
			predefinedSchema,
			packages,
			dimensionUnit
		} = form;

		forEach( predefinedSchema, ( servicePackages, serviceId ) => {
			const serviceSelected = packages.predefined[ serviceId ] || [];

			forEach( servicePackages, ( predefGroup, groupId ) => {
				const groupPackages = predefGroup.definitions;
				const nonFlatRates = reject( groupPackages, 'is_flat_rate' );
				if ( ! nonFlatRates.length ) {
					return;
				}

				const groupSelected = filter( serviceSelected, selectedId => some( groupPackages, pckg => pckg.id === selectedId ) );
				const summary = predefSummary( groupSelected, nonFlatRates );

				elements.push( <FoldableCard
					className="packages__predefined-packages"
					key={ `${ serviceId }_${ groupId }` }
					header={ renderPredefHeader( predefGroup.title, groupSelected, nonFlatRates, serviceId, groupId ) }
					summary={ summary }
					expandedSummary={ summary }
					clickableHeader={ true }
					expanded={ false }
					screenReaderText={ translate( 'Expand Services' ) }
					icon="chevron-down"
				>
					<PackagesList
						siteId={ siteId }
						packages={ groupPackages }
						selected={ groupSelected }
						serviceId={ serviceId }
						groupId={ groupId }
						toggleAll={ props.toggleAll }
						togglePackage={ props.togglePackage }
						dimensionUnit={ dimensionUnit }
						editable={ false } />
				</FoldableCard> );
			} );
		} );

		return elements;
	};

	return (
		<div>
			{ renderPredefinedPackages() }
		</div>
	);
};

PredefinedPackages.PropTypes = {
	siteId: PropTypes.number.isRequired,
	toggleAll: PropTypes.func.isRequired,
	togglePackage: PropTypes.func.isRequired,
	form: PropTypes.shape( {
		packages: PropTypes.object,
		dimensionUnit: PropTypes.string,
		predefinedSchema: PropTypes.object,
	} ).isRequired,
};

export default localize( PredefinedPackages );
