/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { translate as __ } from 'i18n-calypso';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import FormSectionHeading from 'components/forms/form-section-heading';
import Checkbox from 'components/checkbox';
import ActionButtons from 'components/action-buttons';
import FormFieldset from 'components/forms/form-fieldset';
import FormButton from 'components/forms/form-button';
import FoldableCard from 'components/foldable-card';
import Spinner from 'components/spinner';
import PackagesList from './packages-list';
import AddPackageDialog from './add-package';
import * as PackagesActions from '../state/actions';
import * as NoticeActions from 'state/notices/actions';
import GlobalNotices from 'components/global-notices';
import notices from 'notices';

const Packages = ( props ) => {
	const isFetching = props.form.isFetching;

	const foldableActionButton = (
		<button className="foldable-card__action foldable-card__expand" type="button">
			<span className="screen-reader-text">{ __( 'Expand Services' ) }</span>
			<Gridicon icon="chevron-down" size={ 24 } />
		</button>
	);

	const predefSummary = ( serviceSelected, groupDefinitions ) => {
		const groupPackageIds = groupDefinitions.map( ( def ) => def.id );
		const diffLen = _.difference( groupPackageIds, serviceSelected ).length;

		if ( 0 >= diffLen ) {
			return __( 'All packages selected' );
		}

		const selectedCount = groupPackageIds.length - diffLen;
		return __( '%(selectedCount)d package selected', '%(selectedCount)d packages selected', {
			count: selectedCount,
			args: { selectedCount },
		} );
	};

	const renderPredefHeader = ( title, selected, packages, serviceId, groupId ) => {
		if ( ! selected ) {
			return null;
		}

		const onToggle = ( event ) => {
			props.toggleAll( serviceId, groupId, event.target.checked );
		};

		const stopPropagation = ( event ) => event.stopPropagation();

		return (
			<div className="wcc-predefined-packages-group-header" >
				<Checkbox
					checked={ selected.length === packages.length }
					partialChecked={ Boolean( selected.length ) }
					onChange={ onToggle }
					onClick={ stopPropagation } />
				{ title }
			</div>
		);
	};

	const renderPredefinedPackages = () => {
		const elements = [];

		if ( isFetching ) {
			return (
				<div className="loading-spinner">
					<Spinner size={ 24 } />
				</div>
			);
		}

		_.forEach( props.form.predefinedSchema, ( servicePackages, serviceId ) => {
			const serviceSelected = props.form.packages.predefined[ serviceId ] || [];

			_.forEach( servicePackages, ( predefGroup, groupId ) => {
				const groupPackages = predefGroup.definitions;
				const nonFlatRates = _.reject( groupPackages, 'is_flat_rate' );
				if ( ! nonFlatRates.length ) {
					return;
				}

				const groupSelected = _.filter( serviceSelected, selectedId => _.some( groupPackages, pckg => pckg.id === selectedId ) );
				const summary = predefSummary( groupSelected, nonFlatRates );

				elements.push( <FoldableCard
					key={ `${ serviceId }_${ groupId }` }
					header={ renderPredefHeader( predefGroup.title, groupSelected, nonFlatRates, serviceId, groupId ) }
					summary={ summary }
					expandedSummary={ summary }
					clickableHeader={ true }
					compact
					actionButton={ foldableActionButton }
					actionButtonExpanded={ foldableActionButton }
					expanded={ false }
				>
					<PackagesList
						packages={ groupPackages }
						selected={ groupSelected }
						serviceId={ serviceId }
						groupId={ groupId }
						toggleAll={ props.toggleAll }
						togglePackage={ props.togglePackage }
						dimensionUnit={ props.form.dimensionUnit }
						editable={ false } />
				</FoldableCard> );
			} );
		} );

		return elements;
	};

	const onSaveSuccess = () => props.noticeActions.successNotice( __( 'Your packages have been saved.' ), { duration: 5000 } );
	const onSaveFailure = () => props.noticeActions.errorNotice( __( 'Unable to save your packages. Please try again.' ) );
	const onSaveChanges = () => props.submit( onSaveSuccess, onSaveFailure );

	const buttons = [
		{
			label: __( 'Save changes' ),
			onClick: onSaveChanges,
			isPrimary: true,
			isDisabled: props.form.isSaving || props.form.pristine,
		},
	];

	const renderContent = () => {
		if ( ! props.form.packages && ! isFetching ) {
			return (
				<CompactCard className="settings-group-card">
					<p className="error-message">
						{ __( 'Unable to get your settings. Please refresh the page to try again.' ) }
					</p>
				</CompactCard>
			);
		}

		return (
			<div>
				<CompactCard className="settings-group-card">
					<FormSectionHeading className="settings-group-header">{ __( 'Custom packages' ) }</FormSectionHeading>
					<div className="settings-group-content">
						<PackagesList
							packages={ ( props.form.packages || {} ).custom }
							dimensionUnit={ props.form.dimensionUnit }
							editable={ true }
							removePackage={ props.removePackage }
							editPackage={ props.editPackage } />
						{ ( ! isFetching ) && <AddPackageDialog { ...props } /> }
						<FormFieldset className="add-package-button-field">
							<FormButton
								type="button"
								isPrimary={ false }
								compact
								disabled={ isFetching }
								onClick={ props.addPackage } >
								{ __( 'Add a package' ) }
							</FormButton>
						</FormFieldset>
					</div>
				</CompactCard>
				<CompactCard className="settings-group-card">
					<FormSectionHeading className="settings-group-header">{ __( 'Predefined packages' ) }</FormSectionHeading>
					<div className="settings-group-content">
						{ renderPredefinedPackages() }
					</div>
				</CompactCard>
			</div>
		);
	};

	return (
		<div>
			<GlobalNotices id="notices" notices={ notices.list } />
			{ renderContent() }
			<CompactCard className="save-button-bar">
				<ActionButtons buttons={ buttons } />
			</CompactCard>
		</div>
	);
};

Packages.propTypes = {
	addPackage: PropTypes.func.isRequired,
	removePackage: PropTypes.func.isRequired,
	editPackage: PropTypes.func.isRequired,
	dismissModal: PropTypes.func.isRequired,
	setSelectedPreset: PropTypes.func.isRequired,
	savePackage: PropTypes.func.isRequired,
	updatePackagesField: PropTypes.func.isRequired,
	toggleOuterDimensions: PropTypes.func.isRequired,
	setModalErrors: PropTypes.func.isRequired,
	showModal: PropTypes.bool,
	form: PropTypes.object,
	noticeActions: PropTypes.object,
};

export default connect(
	( state ) => state,
	( dispatch ) => (
		{
			...bindActionCreators( PackagesActions, dispatch ),
			noticeActions: bindActionCreators( NoticeActions, dispatch ),
		} )
)( Packages );
