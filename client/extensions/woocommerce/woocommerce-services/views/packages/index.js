/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import ExtendedHeader from 'woocommerce/components/extended-header';
import PackageDialog from './package-dialog';
import PackagesListItem from './packages-list-item';
import QueryPackages from 'woocommerce/woocommerce-services/components/query-packages';
import * as PackagesActions from '../../state/packages/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getPackagesForm,
	getAllSelectedPackages,
	isFetchError,
} from '../../state/packages/selectors';

class Packages extends Component {
	renderListHeader = ( packages ) => {
		const { translate } = this.props;

		if ( ! packages || ! packages.length ) {
			return null;
		}

		return (
			<div className="packages__packages-row packages__packages-header">
				<div className="packages__packages-row-icon" />
				<div className="packages__packages-row-details">{ translate( 'Name' ) }</div>
				<div className="packages__packages-row-dimensions">{ translate( 'Dimensions' ) }</div>
				<div className="packages__packages-row-actions" />
			</div>
		);
	};

	renderListItem = ( pckg, index ) => {
		const { siteId, isFetching, form, translate } = this.props;
		const { dimensionUnit } = form;

		let button = null;
		if ( pckg.is_user_defined ) {
			const onEdit = () => {
				this.props.onChange();
				this.props.editPackage( siteId, pckg );
			};
			button = (
				<Button compact onClick={ onEdit }>
					{ translate( 'Edit' ) }
				</Button>
			);
		} else {
			const onRemove = () => {
				this.props.onChange();
				this.props.removePredefinedPackage( siteId, pckg.serviceId, pckg.id );
			};
			button = (
				<Button compact onClick={ onRemove }>
					{ translate( 'Remove' ) }
				</Button>
			);
		}

		return (
			<PackagesListItem
				key={ index }
				siteId={ siteId }
				isPlaceholder={ isFetching }
				data={ pckg }
				dimensionUnit={ dimensionUnit }
			>
				{ button }
			</PackagesListItem>
		);
	};

	render() {
		const { isFetching, fetchError, siteId, allSelectedPackages, translate } = this.props;
		if ( fetchError ) {
			return null;
		}

		const packages = isFetching ? [ {}, {}, {} ] : allSelectedPackages;

		const addPackage = () => {
			this.props.onChange();
			this.props.addPackage( siteId );
		};

		return (
			<div>
				<QueryPackages siteId={ siteId } />
				<ExtendedHeader
					label={ translate( 'Packages' ) }
					description={ translate(
						'Add boxes, envelopes, and other packages you use most frequently.'
					) }
				>
					<Button onClick={ addPackage } disabled={ isFetching }>
						{ translate( 'Add package' ) }
					</Button>
				</ExtendedHeader>
				<Card className="packages__packages">
					{ this.renderListHeader( packages ) }
					{ packages.map( this.renderListItem ) }
					{ ! isFetching && <PackageDialog { ...this.props } /> }
				</Card>
			</div>
		);
	}
}

Packages.propTypes = {
	addPackage: PropTypes.func.isRequired,
	removePackage: PropTypes.func.isRequired,
	editPackage: PropTypes.func.isRequired,
	dismissModal: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
	savePackage: PropTypes.func.isRequired,
	updatePackagesField: PropTypes.func.isRequired,
	toggleOuterDimensions: PropTypes.func.isRequired,
	setModalErrors: PropTypes.func.isRequired,
	showModal: PropTypes.bool,
	form: PropTypes.shape( {
		packages: PropTypes.object,
		dimensionUnit: PropTypes.string,
		weightUnit: PropTypes.string,
		packageSchema: PropTypes.object,
		predefinedSchema: PropTypes.oneOfType( [ PropTypes.object, PropTypes.array ] ),
	} ).isRequired,
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const form = getPackagesForm( state, siteId ) || {};
		return {
			siteId,
			isFetching: ! form.packages || form.isFetching,
			fetchError: isFetchError( state, siteId ),
			form,
			allSelectedPackages: getAllSelectedPackages( state, siteId ) || [],
		};
	},
	( dispatch ) => ( {
		...bindActionCreators( PackagesActions, dispatch ),
	} )
)( localize( Packages ) );
