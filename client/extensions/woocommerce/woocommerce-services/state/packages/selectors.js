/** @format */

/**
 * External dependencies
 */
import { forEach, get, includes, orderBy, reject } from 'lodash';
import { translate } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSelectedSiteId } from 'state/ui/selectors';

export const getPackagesForm = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'woocommerceServices', siteId, 'packages' ],
		null
	);
};

const getPredefinedPackageServices = form => {
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

			forEach( serviceGroups, group => {
				const definitions = group.definitions;

				forEach( definitions, pckg => {
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
			...( form.packages.custom || [] ),
			...serviceIds.map( serviceId => ( form.packages.predefined || {} )[ serviceId ] ),
		];
	}
);

/**
 * Returns definitions of packages that can be used during the label purchase,
 * including all flat rate boxes. Results are grouped
 * @param {Object} state - state tree
 * @param {Number} siteId - current site id
 * @returns {Object} packages grouped by services
 */
export const getPackageGroupsForLabelPurchase = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		const form = getPackagesForm( state, siteId );
		if ( ! form || ! form.predefinedSchema || ! form.packages ) {
			return null;
		}

		const result = {
			custom: { title: translate( 'Custom Packages' ), definitions: form.packages.custom },
		};

		forEach( form.predefinedSchema, ( serviceGroups, serviceId ) => {
			const serviceSelectedIds = ( form.packages.predefined || {} )[ serviceId ] || [];

			forEach( serviceGroups, ( group, groupId ) => {
				const definitions = group.definitions;
				const resultGroup = { title: group.title, definitions: [] };

				forEach( definitions, pckg => {
					if ( ! pckg.is_flat_rate && ! includes( serviceSelectedIds, pckg.id ) ) {
						return;
					}

					resultGroup.definitions.push( pckg );
				} );

				if ( resultGroup.definitions.length ) {
					result[ groupId ] = resultGroup;
				}
			} );
		} );

		return result;
	},
	( state, siteId = getSelectedSiteId( state ) ) => {
		const form = getPackagesForm( state, siteId );
		if ( ! form || ! form.packages ) {
			return [];
		}

		const serviceIds = getPredefinedPackageServices( form );
		return [
			...( form.packages.custom || [] ),
			...serviceIds.map( serviceId => ( form.packages.predefined || {} )[ serviceId ] ),
		];
	}
);

/**
 * Returns all available package definitions, keyed by their ID
 * @param {Object} state - state tree
 * @param {Number} siteId - current site id
 * @returns {Object} packages keyed by id
 */
export const getAllPackageDefinitions = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		const form = getPackagesForm( state, siteId );
		if ( ! form || ! form.predefinedSchema || ! form.packages ) {
			return null;
		}

		const result = {};
		forEach( form.packages.custom, pckg => {
			result[ pckg.name ] = pckg;
		} );

		forEach( form.predefinedSchema, serviceGroups => {
			forEach( serviceGroups, group => {
				const definitions = group.definitions;
				forEach( definitions, pckg => {
					result[ pckg.id ] = pckg;
				} );
			} );
		} );

		return result;
	},
	( state, siteId = getSelectedSiteId( state ) ) => {
		const form = getPackagesForm( state, siteId );
		if ( ! form || ! form.packages ) {
			return [];
		}

		const serviceIds = getPredefinedPackageServices( form );
		return [
			...( form.packages.custom || [] ),
			...serviceIds.map( serviceId => ( form.packages.predefined || {} )[ serviceId ] ),
		];
	}
);

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

				forEach( definitions, pckg => {
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
			...serviceIds.map( serviceId => form.currentlyEditingPredefinedPackages[ serviceId ] ),
		];
	}
);

/**
 * Returns a summary of edits made to the predefined packages (added packages count, removed packages count)
 * @param {Object} state - state tree
 * @param {Number} siteId - site ID
 * @returns {Object} an object containing the changes summary
 */
export const getPredefinedPackagesChangesSummary = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		let added = 0;
		let removed = 0;

		const form = getPackagesForm( state, siteId );
		if ( ! form || ! form.currentlyEditingPredefinedPackages ) {
			return { added, removed };
		}

		const existingPackages =
			form.packages && form.packages.predefined ? form.packages.predefined : {};
		const editedPackages = form.currentlyEditingPredefinedPackages;
		Object.keys( editedPackages ).forEach( key => {
			const existing = existingPackages[ key ];
			const edited = editedPackages[ key ];

			if ( ! existing ) {
				added += edited.length;
				return;
			}

			edited.forEach( packageId => {
				if ( ! includes( existing, packageId ) ) {
					added++;
				}
			} );
		} );

		Object.keys( existingPackages ).forEach( key => {
			const existing = existingPackages[ key ];
			const edited = editedPackages[ key ];

			if ( ! edited ) {
				removed += existing.length;
				return;
			}

			existing.forEach( packageId => {
				if ( ! includes( edited, packageId ) ) {
					removed++;
				}
			} );
		} );

		return { added, removed };
	},
	( state, siteId = getSelectedSiteId( state ) ) => {
		const form = getPackagesForm( state, siteId );
		if ( ! form || ! form.currentlyEditingPredefinedPackages ) {
			return [];
		}

		const serviceIds = getPredefinedPackageServices( form );
		return [
			...serviceIds.map(
				serviceId =>
					form.packages && form.packages.predefined && form.packages.predefined[ serviceId ]
			),
			...serviceIds.map( serviceId => form.currentlyEditingPredefinedPackages[ serviceId ] ),
		];
	}
);

export const isLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	const form = getPackagesForm( state, siteId );
	return form && form.isLoaded;
};

export const isFetching = ( state, siteId = getSelectedSiteId( state ) ) => {
	const form = getPackagesForm( state, siteId );
	return form && form.isFetching;
};

export const isFetchError = ( state, siteId = getSelectedSiteId( state ) ) => {
	const form = getPackagesForm( state, siteId );
	return form && form.isFetchError;
};
