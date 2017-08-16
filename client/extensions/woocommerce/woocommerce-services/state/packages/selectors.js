/**
 * External dependencies
 */
import { forEach, get, includes, orderBy, reject } from 'lodash';
/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSelectedSiteId } from 'state/ui/selectors';

export const getPackagesForm = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'woocommerceServices', siteId, 'packages' ], null );
};

const getPredefinedPackageServices = ( form ) => {
	if ( ! form || ! form.predefinedSchema ) {
		return [];
	}

	return Object.keys( form.predefinedSchema );
};

/**
 * Returns a list of all selected packages, custom and predefined
 * @param {Object} state - state tree
 * @param {Number} siteId - current site id
 * @returns {Array} selected packages
 */
export const getAllSelectedPackages = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		const form = getPackagesForm( state, siteId );
		if ( ! form || ! form.predefinedSchema || ! form.packages ) {
			return null;
		}

		const packageList = [];
		forEach( form.predefinedSchema, ( serviceGroups, serviceId ) => {
			const serviceSelectedIds = ( form.packages.predefined || {} )[ serviceId ] || [];

			forEach( serviceGroups, ( group ) => {
				const definitions = group.definitions;

				forEach( definitions, ( pckg ) => {
					if ( ! includes( serviceSelectedIds, pckg.id ) ) {
						return;
					}

					packageList.push( {
						...pckg,
						serviceId,
					} );
				} );
			} );
		} );

		const customPackages = ( form.packages.custom || [] ).map( ( pckg, index ) => ( {
			...pckg,
			index,
		} ) );

		return orderBy( packageList.concat( customPackages ), 'name' );
	},
	( state, siteId = getSelectedSiteId( state ) ) => {
		const form = getPackagesForm( state, siteId );
		if ( ! form || ! form.packages ) {
			return [];
		}

		const serviceIds = getPredefinedPackageServices( form );
		return [
			form.packages.custom,
			...serviceIds.map( ( serviceId ) => ( form.packages.predefined || {} )[ serviceId ] )
		];
	} );

/**
 * Returns currently edited predefined non-flat-rate packages, including their definitions,
 * decorated with selected state and service information
 * @param {Object} state - state tree
 * @param {Number} siteId - site ID
 * @returns {Object} an object containing package groups and their definitions
 */
export const getCurrentlyEditingPredefinedPackages = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		const form = getPackagesForm( state, siteId );
		if ( ! form || ! form.currentlyEditingPredefinedPackages ) {
			return null;
		}

		const result = {};
		const { predefinedSchema, currentlyEditingPredefinedPackages } = form;
		forEach( predefinedSchema, ( serviceGroups, serviceId ) => {
			const serviceSelectedIds = currentlyEditingPredefinedPackages[ serviceId ] || [];

			forEach( serviceGroups, ( group, groupId ) => {
				const definitions = group.definitions;
				const nonFlatRateDefinitions = reject( group.definitions, 'is_flat_rate' );
				if ( ! nonFlatRateDefinitions.length ) {
					return;
				}

				const groupResult = {
					groupId,
					serviceId,
					title: group.title,
					packages: [],
					total: nonFlatRateDefinitions.length,
					selected: 0,
				};

				forEach( definitions, ( pckg ) => {
					const selected = includes( serviceSelectedIds, pckg.id );
					if ( selected ) {
						groupResult.selected++;
					}

					groupResult.packages.push( {
						...pckg,
						selected,
						serviceId,
					} );
				} );

				result[ `${ serviceId }-${ groupId }` ] = groupResult;
			} );
		} );

		return result;
	},
	( state, siteId = getSelectedSiteId( state ) ) => {
		const form = getPackagesForm( state, siteId );
		if ( ! form || ! form.currentlyEditingPredefinedPackages ) {
			return [];
		}

		const serviceIds = getPredefinedPackageServices( form );
		return [
			form.packages.custom,
			...serviceIds.map( ( serviceId ) => form.currentlyEditingPredefinedPackages[ serviceId ] )
		];
	} );
