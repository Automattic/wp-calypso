/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import * as PackagesActions from '../../state/packages/actions';
import { getPackagesForm, getAllSelectedPackages } from '../../state/packages/selectors';
import PackageDialog from './package-dialog';
import PackagesListItem from './packages-list-item';
import Button from 'components/button';
import Card from 'components/card';
import { getSelectedSiteId } from 'state/ui/selectors';
import ExtendedHeader from 'woocommerce/components/extended-header';

class Packages extends Component {
	componentWillMount() {
		if ( this.props.siteId ) {
			this.props.fetchSettings( this.props.siteId );
		}
	}

	componentWillReceiveProps( props ) {
		if ( props.siteId && props.siteId !== this.props.siteId ) {
			this.props.fetchSettings( props.siteId );
		}
	}

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
			const onEdit = () => this.props.editPackage( siteId, pckg );
			button = <Button compact onClick={ onEdit }>{ translate( 'Edit' ) }</Button>;
		} else {
			const onRemove = () => this.props.removePredefinedPackage( siteId, pckg.serviceId, pckg.id );
			button = <Button compact onClick={ onRemove }>{ translate( 'Remove' ) }</Button>;
		}

		return (
			<PackagesListItem
				key={ index }
				siteId={ siteId }
				isPlaceholder={ isFetching }
				data={ pckg }
				dimensionUnit={ dimensionUnit }>
				{ button }
			</PackagesListItem>
		);
	};

	render() {
		const { isFetching, siteId, allSelectedPackages, translate } = this.props;
		const packages = isFetching ? [ {}, {}, {} ] : allSelectedPackages;

		const addPackage = () => ( this.props.addPackage( siteId ) );

		return (
			<div>
				<ExtendedHeader
					label={ translate( 'Packages' ) }
					description={ translate( 'Add boxes, envelopes, and other packages you use most frequently.' ) }>
					<Button onClick={ addPackage } disabled={ isFetching }>{ translate( 'Add package' ) }</Button>
				</ExtendedHeader>
				<Card className="packages__packages">
					{ this.renderListHeader( packages ) }
					{ packages.map( this.renderListItem ) }
					{ ( ! isFetching ) && <PackageDialog { ...this.props } /> }
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
		predefinedSchema: PropTypes.object,
	} ).isRequired,
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const form = getPackagesForm( state, siteId );
		return {
			siteId,
			isFetching: ! form || ! form.packages || form.isFetching,
			form,
			allSelectedPackages: getAllSelectedPackages( state, siteId ),
		};
	},
	( dispatch ) => (
		{
			...bindActionCreators( PackagesActions, dispatch ),
		} )
)( localize( Packages ) );
