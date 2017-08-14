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
import Button from 'components/button';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import PackageDialog from './package-dialog';
import PackagesList from './packages-list';
import * as PackagesActions from '../../state/packages/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPackagesForm } from '../../state/packages/selectors';

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

	render() {
		const { isFetching, siteId, form, translate } = this.props;

		const addPackage = () => ( this.props.addPackage( siteId ) );

		return (
			<div>
				<ExtendedHeader
					label={ translate( 'Packages' ) }
					description={ translate( 'Add boxes, envelopes, and other packages you use most frequently.' ) }>
					<Button onClick={ addPackage } disabled={ isFetching }>{ translate( 'Add package' ) }</Button>
				</ExtendedHeader>
				<Card className="packages__packages">
					<PackagesList
						siteId={ siteId }
						isFetching={ isFetching }
						packages={ ( form.packages || {} ).custom }
						dimensionUnit={ form.dimensionUnit }
						editable={ true }
						removePackage={ this.props.removePackage }
						editPackage={ this.props.editPackage } />
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
		};
	},
	( dispatch ) => (
		{
			...bindActionCreators( PackagesActions, dispatch ),
		} )
)( localize( Packages ) );
